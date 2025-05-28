import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";  // Import useNavigate

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();
  const navigate = useNavigate();  // Initialize useNavigate hook

  const login = async (username, password) => {
    const success = handleInputErrors(username, password);
    if (!success) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), 
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Save the user data in local storage
      localStorage.setItem("image-cloak-user", JSON.stringify(data));
      setAuthUser(data);
      toast.success("Login successful!");

      // Redirect based on the user type
      if (data.isAdmin) {
        navigate('/admin-dash');  // Redirect to AdminDash page if admin
      } else {
        navigate('/');  // Redirect to Home page if not an admin
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, login };
};

export default useLogin;

function handleInputErrors(username, password) {
  if (!username || !password) {
    toast.error("Please fill in all fields");
    return false;
  }
  return true;
}
