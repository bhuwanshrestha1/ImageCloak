import React from 'react'
import { useAuthContext } from '../../context/AuthContext'


const Navbar = () => {
  const { authUser } = useAuthContext();
  
  return (
    <div>
      <div className="navbar bg-gray-800 shadow-md">
        <div className="flex-1 p-4">
          <img src="/cologo.png" alt="Logo" className="w-12 h-12" /> {/* Smaller logo */}
          <a className="text-2xl text-white font-semibold ml-2">ImageCloak</a> {/* Logo and text */}
        </div>

        <div className="flex-none gap-4 p-4 text-2xl">
        <i>{authUser?.fullname}</i>
        
        </div>
      </div>
    </div>
  )
}

export default Navbar
