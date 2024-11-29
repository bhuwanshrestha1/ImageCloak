import React, { useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import Sidebar from '../../components/sidebar/Sidebar';
import { useAuthContext } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { authUser, setAuthUser } = useAuthContext(); // Assuming you have a function to update context state
  const [fullName, setFullName] = useState(authUser?.fullname || ''); // Add state for full name
  const [username, setUsername] = useState(authUser?.username || '');
  const [email, setEmail] = useState(authUser?.email || '');
  const [password, setPassword] = useState(''); // Default to empty for password change

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Track if we are in edit mode

  const validateInput = () => {
    if (!fullName || !username || !email) {
      toast.error('Please fill in all fields');
      return false;
    }

    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validate input
    const isValid = validateInput();
    if (!isValid) return;

    // Prepare the data to be sent
    const updatedData = {
      fullName,
      username,
      email,
      newPassword: password, 
    };

    // Log the data for debugging
    console.log('Data being sent for profile update:', updatedData);

    try {
      // Send the update request to the backend
      const response = await axios.put('/api/users/profile', updatedData);

      // Update the context with new user data
      setAuthUser({
        ...authUser,
        fullName: response.data.fullName,
        username: response.data.username,
        email: response.data.email,
        password: response.data.password,
      });

      // Save updated user data to localStorage
      localStorage.setItem(
        'image-cloak-user',
        JSON.stringify({
          ...authUser,
          fullName: response.data.fullName,
          username: response.data.username,
          password: response.data.password,
        })
      );

      setSuccessMessage('Profile updated successfully!');
      setError('');
      setIsEditing(false); // Exit edit mode after successful update
    } catch (err) {
      setError('Failed to update profile');
      setSuccessMessage('');
      console.error('Error updating profile:', err); // Log error for debugging
      toast.error('Failed to update profile');
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex bg-gray-900 min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8 text-white">
          <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-semibold text-center mb-6">Profile</h1>
            <div className="space-y-6">
              <div className="flex justify-between">
                <h2 className="text-lg font-medium text-gray-300">Full Name:</h2>
                {isEditing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-700 text-white p-2 rounded"
                  />
                ) : (
                  <p className="text-lg">{fullName || 'N/A'}</p>
                )}
              </div>
              <div className="flex justify-between">
                <h2 className="text-lg font-medium text-gray-300">Username:</h2>
                {isEditing ? (
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-700 text-white p-2 rounded"
                  />
                ) : (
                  <p className="text-lg">{username}</p>
                )}
              </div>
              <div className="flex justify-between">
                <h2 className="text-lg font-medium text-gray-300">Email:</h2>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-700 text-white p-2 rounded"
                  />
                ) : (
                  <p className="text-lg">{email}</p>
                )}
              </div>
              <div className="flex justify-between">
                <h2 className="text-lg font-medium text-gray-300">Password:</h2>
                {isEditing ? (
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-700 text-white p-2 rounded"
                    placeholder="Enter new password"
                  />
                ) : (
                  <p className="text-lg">******</p> // Masked default password
                )}
              </div>
              <div className="flex justify-between mt-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="bg-blue-600 p-2 rounded text-white"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)} // Cancel editing
                      className="bg-gray-600 p-2 rounded text-white ml-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)} // Enter edit mode
                    className="bg-yellow-600 p-2 rounded text-white"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
