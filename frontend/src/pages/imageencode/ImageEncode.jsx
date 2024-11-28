import React, { useState, useRef } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";

const ImageEncode = () => {
  const [coverImage, setCoverImage] = useState(null); // Cover image (base image)
  const [secretImage, setSecretImage] = useState(null); // Image to be hidden
  const [steganoImage, setSteganoImage] = useState(null); // Resulting encoded image (Stegano Image)
  const [uploadedSteganoImage, setUploadedSteganoImage] = useState(null); // Uploaded Stegano Image for decoding
  const [decodedImage, setDecodedImage] = useState(null); // Decoded secret image
  const canvasRef = useRef(null); // Canvas reference

  // Handle cover image upload
  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle secret image upload
  const handleSecretImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSecretImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Stegano Image upload for decoding
  const handleSteganoImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedSteganoImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Encode secret image into cover image
  const handleEncode = () => {
    if (!coverImage || !secretImage) {
      alert("Please upload both the Cover Image and Secret Image.");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const coverImg = new Image();
    const secretImg = new Image();

    coverImg.src = coverImage;
    secretImg.src = secretImage;

    coverImg.onload = () => {
      // Set canvas dimensions to match the cover image
      canvas.width = coverImg.width;
      canvas.height = coverImg.height;

      // Draw the cover image on the canvas
      ctx.drawImage(coverImg, 0, 0);

      // Get cover image pixel data
      const coverData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const coverPixels = coverData.data;

      secretImg.onload = () => {
        // Resize the secret image to match the cover image dimensions
        const secretCanvas = document.createElement("canvas");
        secretCanvas.width = canvas.width;
        secretCanvas.height = canvas.height;
        const secretCtx = secretCanvas.getContext("2d");

        secretCtx.drawImage(secretImg, 0, 0, canvas.width, canvas.height);
        const secretData = secretCtx.getImageData(0, 0, canvas.width, canvas.height);
        const secretPixels = secretData.data;

        // Encode the secret image into the cover image by modifying the least significant bits
        for (let i = 0; i < coverPixels.length; i += 4) {
          coverPixels[i] = (coverPixels[i] & 0b11111100) | (secretPixels[i] >> 6); // R
          coverPixels[i + 1] = (coverPixels[i + 1] & 0b11111100) | (secretPixels[i + 1] >> 6); // G
          coverPixels[i + 2] = (coverPixels[i + 2] & 0b11111100) | (secretPixels[i + 2] >> 6); // B
        }

        // Update canvas with the encoded pixel data
        ctx.putImageData(coverData, 0, 0);

        // Generate the Stegano Image preview
        const steganoImageUrl = canvas.toDataURL();
        setSteganoImage(steganoImageUrl);
      };
    };
  };

  // Decode the uploaded or generated Stegano Image to retrieve the secret image
  const handleDecode = (imageSource) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const steganoImg = new Image();
    steganoImg.src = imageSource;

    steganoImg.onload = () => {
      // Draw the stegano image onto the canvas
      canvas.width = steganoImg.width;
      canvas.height = steganoImg.height;
      ctx.drawImage(steganoImg, 0, 0);

      // Get stegano image pixel data
      const steganoData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const steganoPixels = steganoData.data;

      // Create a new canvas to hold the decoded secret image
      const decodedCanvas = document.createElement("canvas");
      decodedCanvas.width = canvas.width;
      decodedCanvas.height = canvas.height;
      const decodedCtx = decodedCanvas.getContext("2d");
      const decodedImageData = decodedCtx.createImageData(canvas.width, canvas.height);
      const decodedPixels = decodedImageData.data;

      // Decode the secret image from the stegano image
      for (let i = 0; i < steganoPixels.length; i += 4) {
        decodedPixels[i] = (steganoPixels[i] & 0b00000011) << 6; // R
        decodedPixels[i + 1] = (steganoPixels[i + 1] & 0b00000011) << 6; // G
        decodedPixels[i + 2] = (steganoPixels[i + 2] & 0b00000011) << 6; // B
        decodedPixels[i + 3] = 255; // Alpha
      }

      // Put the decoded pixel data into the new canvas
      decodedCtx.putImageData(decodedImageData, 0, 0);

      // Generate the Decoded Image preview
      const decodedImageUrl = decodedCanvas.toDataURL();
      setDecodedImage(decodedImageUrl);
    };
  };

  // Refresh/reset everything
  const handleRefresh = () => {
    setCoverImage(null);
    setSecretImage(null);
    setSteganoImage(null);
    setUploadedSteganoImage(null);
    setDecodedImage(null);
    document.getElementById("cover-image-upload").value = null;
    document.getElementById("secret-image-upload").value = null;
    document.getElementById("stegano-image-upload").value = null;
  };

  // Function to handle download of the Stegano Image
  const handleDownloadSteganoImage = () => {
    const link = document.createElement("a");
    link.href = steganoImage;
    link.download = "stegano_image.png";
    link.click();
  };

  return (
    <>
      <Navbar />
      <div style={{ display: "flex", overflow: "hidden", height: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "30px", display: "flex", flexDirection: "column" }}>
          {/* Upload Section */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div className="bg-gray-900" style={{ flex: 1, padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
              <label htmlFor="cover-image-upload" style={{ display: "block", marginBottom: "10px", color: "white" }}>
                Upload Cover Image
              </label>
              <input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <label htmlFor="secret-image-upload" style={{ display: "block", marginBottom: "10px", color: "white" }}>
                Upload Secret Image
              </label>
              <input
                id="secret-image-upload"
                type="file"
                accept="image/*"
                onChange={handleSecretImageUpload}
                style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleEncode}
                  style={{
                    flex: 1,
                    background: "#007bff",
                    color: "white",
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "background 0.3s",
                  }}
                >
                  Encode Image
                </button>
                <button
                  onClick={handleRefresh}
                  style={{
                    flex: 1,
                    background: "#6c757d",
                    color: "white",
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "background 0.3s",
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="bg-gray-900" style={{ flex: 1, padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
              <label htmlFor="stegano-image-upload" style={{ display: "block", marginBottom: "10px", color: "white" }}>
                Upload Stegano Image for Decoding
              </label>
              <input
                id="stegano-image-upload"
                type="file"
                accept="image/*"
                onChange={handleSteganoImageUpload}
                style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleDecode(uploadedSteganoImage || steganoImage)}
                  style={{
                    flex: 1,
                    background: "#28a745",
                    color: "white",
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "background 0.3s",
                  }}
                >
                  Decode Image
                </button>
              </div>
            </div>
          </div>

          {/* Display Result */}
          {steganoImage && (
            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", marginBottom: "20px" }}>
              <h4>Encoded Stegano Image</h4>
              <img src={steganoImage} alt="Stegano Image" style={{ width: "100%", maxHeight: "400px", objectFit: "contain", borderRadius: "8px" }} />
              <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                <button
                  onClick={handleDownloadSteganoImage}
                  style={{
                    background: "#007bff",
                    color: "white",
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Download Stegano Image
                </button>
              </div>
            </div>
          )}

          {decodedImage && (
            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", marginBottom: "20px" }}>
              <h4>Decoded Secret Image</h4>
              <img src={decodedImage} alt="Decoded Secret" style={{ width: "100%", maxHeight: "400px", objectFit: "contain", borderRadius: "8px" }} />
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
        </div>
      </div>
    </>
  );
};

export default ImageEncode;
