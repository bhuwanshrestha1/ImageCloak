import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import axios from "axios";
import { FaTimes } from "react-icons/fa"; // Import clear icon from react-icons

const ShareImage = () => {
  const [users, setUsers] = useState([]); // State to hold the list of users
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [searchTerm, setSearchTerm] = useState(""); // State for the search input
  const [showUsers, setShowUsers] = useState(false); // State to control whether to show users
  const [selectedUser, setSelectedUser] = useState(null); // State for the selected user in the chat
  const [messages, setMessages] = useState([]); // State to hold chat messages (images only)
  const [selectedImage, setSelectedImage] = useState(null); // State to store the selected image before sending

  // Fetching the users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/users"); // Get all users from the API
        setUsers(data); // Update users state with the fetched data
        setLoading(false); // Set loading to false once data is fetched
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred"); // Handle errors
        setLoading(false); // Set loading to false on error
      }
    };

    fetchUsers(); // Call the fetch function
  }, []); // Empty dependency array ensures this runs once on component mount

  // Filtering users based on the search term (email in this case)
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle image upload for chat
  const handleImageSend = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); // Store the selected image
      };
      reader.readAsDataURL(file); // Read the image file as a data URL
    } else {
      alert("Please upload a valid image.");
    }
  };

  // Handle sending the image as a message
  const handleSendMessage = () => {
    if (selectedImage && selectedUser) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { image: selectedImage, sender: "You" },
      ]);
      setSelectedImage(null); // Reset the selected image after sending
    } else {
      alert("Please select an image and a user to send the message.");
    }
  };

  // Handle resetting the image
  const handleResetImage = () => {
    setSelectedImage(null); // Reset the selected image
  };

  // Clear the selected user when the search term is cleared
  useEffect(() => {
    if (!searchTerm) {
      setSelectedUser(null); // Reset selected user when search term is cleared
    }
  }, [searchTerm]);

  // Loading, error, and data rendering logic
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Navbar /> {/* Include Navbar */}
      <div className="flex bg-gray-900 min-h-screen" style={{ height: "100vh" }}>
        <Sidebar />
        <div className="flex-1 p-8 text-white">
          <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">All Users</h1>
            {/* Search Bar */}
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="Search by email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 bg-gray-700 text-white rounded w-full"
                onFocus={() => setShowUsers(false)} // Hide users when focusing on the input
              />
              {/* Clear Icon */}
              {searchTerm && (
                <FaTimes
                  className="absolute right-2 top-2 text-white cursor-pointer"
                  onClick={() => setSearchTerm("")} // Clear searchTerm on click
                />
              )}
            </div>

            {/* Only show users after clicking "Show Users" button */}
            {showUsers && searchTerm && filteredUsers.length === 0 && (
              <p className="text-gray-300">No users found.</p>
            )}

            {/* Show users list */}
            {showUsers && searchTerm && filteredUsers.length > 0 && (
              <ul className="space-y-2">
                {filteredUsers.map((user) => (
                  <li
                    key={user._id}
                    className="p-4  rounded-lg shadow hover:bg-gray-500 transition cursor-pointer"
                    onClick={() => setSelectedUser(user)} // Select user to start chat
                  >
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Full Name:</strong> {user.fullname}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* Show "Show Users" button only after entering search term */}
            {searchTerm && !showUsers && (
              <div className="mt-4">
                <button
                  onClick={() => setShowUsers(true)} // Show users when the button is clicked
                  className="bg-blue-500 text-white p-2 rounded-lg"
                >
                  Show Users
                </button>
              </div>
            )}

            {/* Chat Interface for selected user */}
            {selectedUser && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">Chat with {selectedUser.username}</h2>
                <div className="mt-4 bg-gray-700 p-4 rounded-lg h-64 overflow-auto">
                  {/* Display sent images */}
                  {messages.length === 0 ? (
                    <p className="text-gray-300">No messages yet. Send an image to start the chat.</p>
                  ) : (
                    messages.map((msg, index) => (
                      <div key={index} className="mb-4">
                        <p className="font-semibold text-white">{msg.sender}</p>
                        <img
                          src={msg.image}
                          alt="Sent Image"
                          className="w-48 h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))
                  )}

                  {/* Display the selected image inside the message box as preview */}
                  {selectedImage && (
                    <div className="mt-4">
                      <p className="text-white">Your Image Preview:</p>
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Image upload input */}
                <div className="mt-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSend}
                    className="bg-gray-700 text-white p-2 rounded-lg"
                  />
                </div>

                {/* Send and Reset buttons */}
                <div className="mt-4 flex gap-4">
                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    className="bg-green-500 text-white p-2 rounded-lg"
                  >
                    Send Image
                  </button>

                  {/* Reset Button */}
                  <button
                    onClick={handleResetImage}
                    className="bg-red-500 text-white p-2 rounded-lg"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareImage;
