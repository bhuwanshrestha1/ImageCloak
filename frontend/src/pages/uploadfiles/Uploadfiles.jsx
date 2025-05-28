import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import axios from "axios";

const Uploadfiles = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null); // State for modal preview
  const [confirmDelete, setConfirmDelete] = useState(false); // State for delete confirmation modal
  const [imageToDelete, setImageToDelete] = useState(null); // State for the image to be deleted

  // Fetch uploaded images on component mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("/api/images", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,  // Get token from localStorage
          },
        });
        setUploadedImages(response.data);
      } catch (err) {
        console.error("Error fetching images:", err);
      }
    };

    fetchImages();
  }, [success]); // Refresh images on successful upload

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select an image to upload.");

    const formData = new FormData();
    formData.append("image", image);  // 'image' matches the backend field name

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      // Send the image to the server
      const response = await axios.post("/api/images/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,  // Add Authorization header
        },
      });

      setSuccess("Image uploaded successfully!");
      setImage(null);
      setPreview(null);  // Clear preview after upload
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setPreviewImage(imageUrl); // Open modal with clicked image
  };

  const handleCloseModal = () => {
    setPreviewImage(null); // Close modal
  };

  const handleDownload = (imageUrl) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageUrl.split("/").pop(); // Use file name from the URL
    link.click();
  };

  const handleShare = (imageUrl) => {
    if (navigator.share) {
      navigator.share({
        title: "Check out this image",
        url: imageUrl,
      });
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/api/images/delete/${imageToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,  // Add the token for authentication
        },
      });

      setSuccess(response.data.message);
      setUploadedImages(uploadedImages.filter(image => image._id !== imageToDelete));
      setConfirmDelete(false); // Close the confirmation modal
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete image.");
      setConfirmDelete(false); // Close the confirmation modal in case of error
    }
  };

  const handleConfirmDelete = (imageId) => {
    setImageToDelete(imageId);  // Set the image ID to delete
    setConfirmDelete(true);     // Show confirmation modal
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);  // Close confirmation modal without deleting
  };

  return (
    <>
      <Navbar />
      <div className="flex bg-gray-900 min-h-screen">
        <Sidebar />
        <div className="flex flex-col items-center justify-center flex-1 text-white p-8 space-y-8">
          {/* Title Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-100 mb-6">Upload an Image</h2>
          </div>

          {/* File upload section */}
          <div className="w-full max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full mb-4 p-3 text-sm text-gray-800 bg-gray-700 rounded-md"
            />
            {preview && (
              <div className="mb-4 text-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            )}
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
            {error && <p className="text-red-400 mt-3 text-center">{error}</p>}
            {success && <p className="text-green-400 mt-3 text-center">{success}</p>}
          </div>

          {/* Display previously uploaded images */}
          <div className="w-full max-w-5xl mx-auto mt-12">
            <h3 className="text-2xl font-semibold text-gray-100 mb-6">Uploaded Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {uploadedImages.length > 0 ? (
                uploadedImages.map((image) => (
                  <div key={image._id} className="relative group rounded-lg overflow-hidden">
                    <img
                      src={image.image}
                      alt="Uploaded"
                      className="w-full h-40 object-cover transition-transform duration-300 transform group-hover:scale-105 cursor-pointer"
                      onClick={() => handleImageClick(image.image)} // On click, show image in modal
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white py-1 text-center text-sm">
                      Uploaded
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 space-x-2">
                      <button
                        className="text-white bg-blue-600 p-1 rounded-md text-xs"
                        onClick={() => handleDownload(image.image)}
                      >
                        Download
                      </button>
                      <button
                        className="text-white bg-green-600 p-1 rounded-md text-xs"
                        onClick={() => handleShare(image.image)}
                      >
                        Share
                      </button>
                      {/* Delete Button */}
                      <button
                        className="text-white bg-red-600 p-1 rounded-md text-xs"
                        onClick={() => handleConfirmDelete(image._id)}  // Trigger confirmation modal
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center w-full">No images uploaded yet.</p>
              )}
            </div>
          </div>

          {/* Modal for Image Preview */}
          {previewImage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="relative bg-gray-800 p-4 rounded-lg max-w-lg mx-auto">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-2 right-2 text-white bg-red-600 p-2 rounded-full"
                >
                  X
                </button>
                <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg" />
              </div>
            </div>
          )}

          {/* Confirmation Modal for Delete */}
          {confirmDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg text-center max-w-sm mx-auto">
                <p className="text-white mb-4">Are you sure you want to delete this image?</p>
                <div className="space-x-4">
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-md"
                    onClick={handleDelete}
                  >
                    Yes, Delete
                  </button>
                  <button
                    className="bg-gray-600 text-white px-4 py-2 rounded-md"
                    onClick={handleCancelDelete}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Uploadfiles;
