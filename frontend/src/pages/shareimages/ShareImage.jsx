import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import axios from "axios";
import { FiDownload } from "react-icons/fi";

const ShareImage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data } = await axios.get("/api/users/profile");
        setCurrentUser(data);
      } catch (err) {
        setError("Failed to fetch current user");
      }
    };

    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/users");
        setUsers(data);
      } catch (err) {
        setError("Failed to fetch users");
      }
      setLoading(false);
    };

    fetchCurrentUser().then(fetchUsers);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/api/messages/${selectedUser._id}`);
      setMessages(data);
    } catch (err) {
      setError("Failed to fetch messages");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser) return alert("Please select a user to send a message.");

    const formData = new FormData();
    formData.append("message", message);
    if (image) formData.append("image", image);

    try {
      await axios.post(`/api/messages/send/${selectedUser._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("");
      setImage(null);
      fetchMessages(); // Refresh messages after sending
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const filteredUsers = users.filter((user) => user._id !== currentUser?._id && !user.isAdmin);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleImageDownload = (imageUrl) => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = imageUrl.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <Navbar />
      <div className="flex bg-gray-900 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex p-8 text-white">
          {/* Users List */}
          <div className="w-1/3 bg-gray-800 p-4 rounded-lg overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Users</h2>
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className={`p-3 mb-2 rounded cursor-pointer ${selectedUser?._id === user._id ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => setSelectedUser(user)}
              >
                {user.username} ({user.email})
              </div>
            ))}
          </div>
          {/* Conversation Section */}
          <div className="w-2/3 bg-gray-800 p-8 rounded-lg ml-4 flex flex-col">
            {selectedUser ? (
              <>
                <h2 className="text-xl font-bold mb-4">Chat with {selectedUser.username}</h2>
                <div className="h-80 overflow-y-auto p-4 bg-gray-700 rounded mb-4 flex flex-col">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`p-3 mb-2 rounded max-w-xs ${msg.senderId === currentUser?._id ? 'bg-blue-500 ml-auto text-right' : 'bg-gray-600 text-left'}`}
                      >
                        <p className="text-sm font-bold">{msg.senderId === currentUser?._id ? 'You' : selectedUser.username}</p>
                        <p className="mt-1">{msg.message}</p>
                        {msg.image && (
                          <div className="mt-2 flex items-center">
                            <img src={msg.image} alt="Sent" className="w-32 rounded" />
                            <button
                              onClick={() => handleImageDownload(msg.image)}
                              className="ml-2 text-blue-300 hover:text-blue-500"
                            >
                              <FiDownload className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400">Send a message to start the conversation</div>
                  )}
                </div>
                <textarea
                  className="w-full p-2 bg-gray-700 rounded mb-2"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full p-2 bg-gray-700 rounded mb-2"
                />
                <button
                  className="bg-blue-500 px-4 py-2 rounded text-white"
                  onClick={handleSendMessage}
                >
                  Send Message
                </button>
              </>
            ) : (
              <div className="text-center text-gray-400">Select a user to start chatting</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareImage;