import React, { useState } from "react";
import useLogin from "../../hooks/useLogin";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { loading, login } = useLogin();

  const handleShowPasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill out all fields");
      return;
    }
    try {
      await login(username, password);
      setError(""); // Clear any previous error
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        <form onSubmit={handleSubmit}>
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-300 font-medium">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="w-full p-2 border border-gray-600 bg-gray-700 rounded mt-2 text-white"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="show-password"
              checked={showPassword}
              onChange={handleShowPasswordToggle}
              className="mr-2"
            />
            <label htmlFor="show-password" className="text-gray-400">
              Show Password
            </label>
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center mt-4">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-400 hover:underline">
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
