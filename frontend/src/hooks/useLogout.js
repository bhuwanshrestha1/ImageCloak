import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const useLogout = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const logout = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
    
            // Log response details
            console.log("Response Status:", res.status);
            const responseBody = await res.text();
            console.log("Response Body:", responseBody);
    
            if (!res.ok) {
                throw new Error("Logout failed");
            }
    
            // Parse response only if it's successful
            const data = JSON.parse(responseBody);
            localStorage.removeItem("image-cloak-user");
            setAuthUser(null);
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };
	return { loading, logout };
};
export default useLogout;