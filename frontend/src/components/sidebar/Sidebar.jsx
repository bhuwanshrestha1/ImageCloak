import React from 'react';
import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';  // Import the logout icon
import useLogout from '../../hooks/useLogout';

const Sidebar = () => {
  const { loading, logout } = useLogout();

  return (
    <div className="h-screen w-80 bg-gray-800 shadow-lg flex flex-col">
      <div className="flex flex-col space-y-6 p-4 flex-grow">
        <Link to="/">
          <button className="text-lg text-white hover:bg-gray-700 py-2 px-4 rounded-lg transition-all duration-300">
            Home
          </button>
        </Link>
        <Link to="/profile">
          <button className="text-lg text-white hover:bg-gray-700 py-2 px-4 rounded-lg transition-all duration-300">
            Profile
          </button>
        </Link>
        <Link to="/textencode">
          <button className="text-lg text-white hover:bg-gray-700 py-2 px-4 rounded-lg transition-all duration-300">
            Text Encode
          </button>
        </Link>
        <Link to="/imageencode">
          <button className="text-lg text-white hover:bg-gray-700 py-2 px-4 rounded-lg transition-all duration-300">
            Image Encode
          </button>
        </Link>
      </div>

      {/* Logout icon at the bottom */}
      <div
        className="p-4 cursor-pointer mt-auto"
        onClick={logout}
      >
        <FiLogOut className="text-white text-3xl" /> {/* Logout icon with size 3xl */}
      </div>
    </div>
  );
};

export default Sidebar;
