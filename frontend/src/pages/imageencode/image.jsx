import React, { useState, useRef } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import axios from 'axios';

const ImageEncode = () => {
  const [coverImage, setCoverImage] = useState(null); // Cover image (base image)
  const [secretImage, setSecretImage] = useState(null); // Image to be hidden
  const [steganoImage, setSteganoImage] = useState(null); // Resulting encoded image (Stegano Image)
  const [uploadedSteganoImage, setUploadedSteganoImage] = useState(null); // Uploaded Stegano Image for decoding
  const [decodedImage, setDecodedImage] = useState(null); // Decoded secret image
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
    setSecretImage(null);
    setSteganoImage(null);
    setUploadedSteganoImage(null);
    setDecodedImage(null);
    setIsEncoding(true);
    document.getElementById("cover-image-upload").value = "";
    document.getElementById("secret-image-upload").value = "";
    document.getElementById("stegano-image-upload").value = "";
  };

  // Encode secret image into cover image
  const handleEncode = async () => {
    if (!coverImage || !secretImage) {
      alert("Please upload both the Cover Image and Secret Image.");
      return;
    }
    setIsProcessing(true);

    // Prepare form data to send to backend
    const formData = new FormData();
    formData.append("cover_image", coverImage);
    formData.append("secret_image", secretImage);

    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.stego_image_url) {
        setSteganoImage(response.data.stego_image_url);
      }
      setIsProcessing(false);
    } catch (error) {
      alert("Error encoding image: " + error.message);
      setIsProcessing(false);
    }
  };

  // Decode the uploaded or generated Stegano Image to retrieve the secret image
  const handleDecode = async () => {
    if (!uploadedSteganoImage && !steganoImage) {
      alert("Please upload a Stegano Image to decode.");
      return;
    }
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("stego_image", uploadedSteganoImage || steganoImage);

    try {
      const response = await axios.post('http://127.0.0.1:5000/reveal', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.secret_image_url) {
        setDecodedImage(response.data.secret_image_url);
      }
      setIsProcessing(false);
    } catch (error) {
      alert("Error decoding image: " + error.message);
      setIsProcessing(false);
    }
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
              <h3>Encode Secret Image into Stego Image</h3>
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
              {/* Secret Image Upload */}
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="secret-image-upload">Upload Secret Image:</label>
                <input
                  id="secret-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setSecretImage)}
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
                  <img src={steganoImage} alt="Stegano Image" style={{ width: "100%", maxHeight: "400px", objectFit: "contain" }} />
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
              <h3>Decode Secret Image from Stegano Image</h3>
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
                onClick={handleDecode}
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
              {decodedImage && (
                <div style={{ marginTop: "20px" }}>
                  <h4>Decoded Secret Image</h4>
                  <img src={decodedImage} alt="Decoded Secret" style={{ width: "100%", maxHeight: "400px", objectFit: "contain" }} />
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

export default ImageEncode;
