import React, { useState } from 'react';
import useSignup from '../../hooks/useSignup';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const [inputs,setInputs] = useState({
    fullname:  '',
    email:  '',
    username:  '',
    password:  '',
    confirmPassword:  '',
  })

  const {loading, signup} = useSignup()

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    console.log(inputs)
    await signup(inputs); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="full-name" className="block text-gray-300 font-medium">
              Full Name
            </label>
            <input
              type="text"
              id="full-name"
              name="full-name"
              className="w-full p-2 border border-gray-600 bg-gray-700 rounded mt-2 text-white"
              placeholder="Enter your full name"
              value={inputs.fullname}
              onChange={(e) => setInputs({...inputs, fullname: e.target.value})}
            />
          </div>

   

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-2 border border-gray-600 bg-gray-700 rounded mt-2 text-white"
              placeholder="Enter your email"
              value={inputs.email}
              onChange={(e) => setInputs({...inputs, email: e.target.value})}
            />
          </div>

          {/* Username */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300 font-medium">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full p-2 border border-gray-600 bg-gray-700 rounded mt-2 text-white"
              placeholder="Enter username"
              value={inputs.username}
              onChange={(e) => setInputs({...inputs, username: e.target.value})}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-300 font-medium">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              className="w-full p-2 border border-gray-600 bg-gray-700 rounded mt-2 text-white"
              placeholder="Enter password"
              value={inputs.password}
              onChange={(e) => setInputs({...inputs, password: e.target.value})}
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-300 font-medium">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              className="w-full p-2 border border-gray-600 bg-gray-700 rounded mt-2 text-white"
              placeholder="Confirm your password"
              value={inputs.confirmPassword}
              onChange={(e) => setInputs({...inputs, confirmPassword: e.target.value})}
            />
          </div>

          {/* Show Password */}
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="show-password"
              checked={showPassword}
              onChange={handleShowPasswordToggle}
              className="mr-2"
            />
            <label htmlFor="show-password" className="text-gray-400">Show Password</label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            Sign Up
          </button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-blue-400 hover:underline">
                Login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
