import React, { useState, useRef } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";

const TextEncode = () => {
  const [coverImage, setCoverImage] = useState(null); // Cover image (base image)
  const [secretText, setSecretText] = useState(""); // Secret text to be hidden
  const [steganoImage, setSteganoImage] = useState(null); // Resulting encoded image (Stegano Image)
  const [uploadedSteganoImage, setUploadedSteganoImage] = useState(null); // Uploaded Stegano Image for decoding
  const [decodedText, setDecodedText] = useState(null); // Decoded secret text
  const [isEncoding, setIsEncoding] = useState(true); // Toggle between encode and decode modes
  const [isProcessing, setIsProcessing] = useState(false); // Loading state
  const canvasRef = useRef(null); // Canvas reference

  // Handle image upload via file input
  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Reset all states
  const handleReset = () => {
    setCoverImage(null);
    setSecretText("");
    setSteganoImage(null);
    setUploadedSteganoImage(null);
    setDecodedText(null);
    setIsEncoding(true);
    document.getElementById("cover-image-upload").value = "";
    document.getElementById("secret-text-input").value = "";
    document.getElementById("stegano-image-upload").value = "";
  };

  // Encode secret text into cover image using byte-level encoding
  const handleEncode = async () => {
    if (!coverImage || !secretText) {
      alert("Please upload a Cover Image and enter Secret Text.");
      return;
    }
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const coverImg = new Image();
    coverImg.src = coverImage;

    coverImg.onload = () => {
      canvas.width = coverImg.width;
      canvas.height = coverImg.height;
      ctx.drawImage(coverImg, 0, 0);

      const coverData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const coverPixels = coverData.data;

      // Convert secret text to binary and add a null byte (0x00) for termination
      let binaryText = "";
      for (let i = 0; i < secretText.length; i++) {
        binaryText += secretText.charCodeAt(i).toString(2).padStart(8, "0");
      }
      binaryText += "00000000"; // Add null byte (0x00) to signify end of message

      let textIndex = 0;

      // Encode each byte of the binary text into the LSB of the image pixels
      for (let i = 0; i < coverPixels.length; i += 4) {
        if (textIndex < binaryText.length) {
          // R channel
          coverPixels[i] = (coverPixels[i] & 0b11111110) | parseInt(binaryText[textIndex]);
          textIndex++;

          // G channel
          if (textIndex < binaryText.length) {
            coverPixels[i + 1] = (coverPixels[i + 1] & 0b11111110) | parseInt(binaryText[textIndex]);
            textIndex++;
          }

          // B channel
          if (textIndex < binaryText.length) {
            coverPixels[i + 2] = (coverPixels[i + 2] & 0b11111110) | parseInt(binaryText[textIndex]);
            textIndex++;
          }
        }
      }

      ctx.putImageData(coverData, 0, 0);
      const steganoImageUrl = canvas.toDataURL();
      setSteganoImage(steganoImageUrl);
      setIsProcessing(false);
    };
  };

  // Decode the uploaded or generated Stegano Image to retrieve the secret text
  const handleDecode = async (imageSource) => {
    if (!imageSource) {
      alert("Please upload a Stegano Image to decode.");
      return;
    }
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const steganoImg = new Image();
    steganoImg.src = imageSource;

    steganoImg.onload = () => {
      canvas.width = steganoImg.width;
      canvas.height = steganoImg.height;
      ctx.drawImage(steganoImg, 0, 0);

      const steganoData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const steganoPixels = steganoData.data;

      let binaryText = "";
      let nullByteFound = false;

      for (let i = 0; i < steganoPixels.length; i += 4) {
        // Extract the LSB from each color channel
        binaryText += (steganoPixels[i] & 0b00000001).toString(); // R channel
        binaryText += (steganoPixels[i + 1] & 0b00000001).toString(); // G channel
        binaryText += (steganoPixels[i + 2] & 0b00000001).toString(); // B channel

        // Check if the last 8 bits are the null byte (00000000)
        if (binaryText.length >= 8 && binaryText.slice(-8) === "00000000") {
          nullByteFound = true;
          binaryText = binaryText.slice(0, -8); // Remove the null byte
          break; // Stop decoding once the null byte is found
        }
      }

      if (nullByteFound) {
        // Decode the binary text into characters
        let decodedText = "";
        for (let i = 0; i < binaryText.length; i += 8) {
          const byte = binaryText.slice(i, i + 8);
          if (byte.length === 8) {
            decodedText += String.fromCharCode(parseInt(byte, 2));
          }
        }

        // Set the decoded text
        setDecodedText(decodedText);
      } else {
        setDecodedText("No secret text found or incomplete message.");
      }

      setIsProcessing(false);
    };
  };

  // Download the Stegano Image
  const handleDownloadSteganoImage = () => {
    const link = document.createElement("a");
    link.href = steganoImage;
    link.download = "stegano_image.png";
    link.click();
  };

  return (
    <>
      <Navbar />
      <div style={{ display: "flex", overflow: "hidden" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column" }}>
          {/* Toggle between Encode and Decode */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <button
              onClick={() => setIsEncoding(true)}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "10px 20px",
                borderRadius: "4px",
                flex: 1,
                marginRight: "10px",
              }}
            >
              Encode
            </button>
            <button
              onClick={() => setIsEncoding(false)}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "10px 20px",
                borderRadius: "4px",
                flex: 1,
              }}
            >
              Decode
            </button>
          </div>

          {isEncoding ? (
            <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
              <h3>Encode Secret Text into Stego Image</h3>
              {/* Cover Image Upload */}
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="cover-image-upload">Upload Cover Image:</label>
                <input
                  id="cover-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setCoverImage)}
                  style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                />
              </div>
              {/* Secret Text Input */}
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="secret-text-input">Enter Secret Text:</label>
                <input
                  id="secret-text-input"
                  type="text"
                  onChange={(e) => setSecretText(e.target.value)}
                  style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                />
              </div>
              <button
                onClick={handleEncode}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  width: "100%",
                }}
              >
                {isProcessing ? "Encoding..." : "Encode"}
              </button>
              <button
                onClick={handleReset}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                Reset
              </button>
              {steganoImage && (
                <div style={{ marginTop: "20px" }}>
                  <h4>Encoded Stegano Image</h4>
                  <img
                    src={steganoImage}
                    alt="Stegano Image"
                    style={{ width: "100%", maxHeight: "400px", objectFit: "contain" }}
                  />
                  <button
                    onClick={handleDownloadSteganoImage}
                    style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "4px",
                      width: "100%",
                      marginTop: "10px",
                    }}
                  >
                    Download Stegano Image
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
              <h3>Decode Secret Text from Stegano Image</h3>
              {/* Stegano Image Upload */}
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="stegano-image-upload">Upload Stegano Image:</label>
                <input
                  id="stegano-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setUploadedSteganoImage)}
                  style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                />
              </div>
              <button
                onClick={() => handleDecode(uploadedSteganoImage || steganoImage)}
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  width: "100%",
                }}
              >
                {isProcessing ? "Decoding..." : "Decode"}
              </button>
              <button
                onClick={handleReset}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                Reset
              </button>
              {decodedText && (
                <div style={{ marginTop: "20px" }}>
                  <h4>Decoded Secret Text</h4>
                  <p>{decodedText}</p>
                </div>
              )}
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
        </div>
      </div>
    </>
  );
};

export default TextEncode;
