import React from 'react';
import Navbar from '../../components/navbar/Navbar';
import Sidebar from '../../components/sidebar/Sidebar';
import { useAuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { authUser } = useAuthContext();

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
                <p className="text-lg">{authUser?.fullname || 'N/A'}</p>
              </div>
              <div className="flex justify-between">
                <h2 className="text-lg font-medium text-gray-300">Username:</h2>
                <p className="text-lg">{authUser?.username || 'N/A'}</p>
              </div>
              <div className="flex justify-between">
                <h2 className="text-lg font-medium text-gray-300">Email:</h2>
                <p className="text-lg">{authUser?.emai || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
