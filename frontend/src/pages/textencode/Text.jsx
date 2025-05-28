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

  // Encode secret text into cover image using backend API
  const handleEncode = async () => {
    if (!coverImage || !secretText) {
      alert("Please upload a Cover Image and enter Secret Text.");
      return;
    }
    setIsProcessing(true);

    // Create FormData to send to the backend
    const formData = new FormData();
    formData.append("image", coverImage); // Append the image
    formData.append("hidden_text", secretText); // Append the secret text

    try {
      // Send POST request to encode the text into the image
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.stego_image_url) {
        setSteganoImage(data.stego_image_url);
      } else {
        alert("Error encoding the text into the image.");
      }
    } catch (error) {
      console.error("Error encoding:", error);
      alert("Error encoding the text into the image.");
    }
    setIsProcessing(false);
  };

  // Decode the uploaded or generated Stegano Image to retrieve the secret text
  const handleDecode = async (imageSource) => {
    if (!imageSource) {
      alert("Please upload a Stegano Image to decode.");
      return;
    }
    setIsProcessing(true);

    // Create FormData to send to the backend
    const formData = new FormData();
    formData.append("stegano_image", imageSource); // Append the stego image

    try {
      // Send POST request to decode the text from the stego image
      const response = await fetch("http://127.0.0.1:5000/decode", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.decoded_text) {
        setDecodedText(data.decoded_text);
      } else {
        alert("Error decoding the text from the image.");
      }
    } catch (error) {
      console.error("Error decoding:", error);
      alert("Error decoding the text from the image.");
    }
    setIsProcessing(false);
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
        </div>
      </div>
    </>
  );
};

export default TextEncode;
