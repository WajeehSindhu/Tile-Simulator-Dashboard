import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [tileLoading, setTileLoading] = useState(false);
  const [tileError, setTileError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsAuthChecked(true);
  }, []);

  const signIn = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:5000/api/signin", {
        email: credentials.email,
        password: credentials.password,
      });

      // Simulate delay (optional)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const userData = response.data;
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Sign in failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const forgotPassword = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/forgot-password",
        { email }
      );
      setMessage(response.data.message);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return response.data.message;
    } catch (error) {
      const errMsg =
        error.response?.data?.error || "Failed to send reset instructions.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };
  // ✅ NEW resetPassword method
  const resetPassword = async (token, password, confirmPassword) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/reset-password/${token}`,
        {
          password,
          confirmPassword,
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setMessage(response.data.message || "Password reset successful!");
      return response.data.message;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Password reset failed.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    // Clear user data from localStorage
    localStorage.removeItem("user");
    // Navigate to sign in
    navigate("/signin");
  };

  const addTile = async (formData) => {
    setTileLoading(true);
    setTileError(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/tiles",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to add tile";
      setTileError(errMsg);
      throw new Error(errMsg);
    } finally {
      setTileLoading(false);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthChecked,
        isLoading,
        user,
        error,
        message,
        signIn,
        signOut,
        forgotPassword,
        resetPassword,
        addTile,
        tileLoading,
        tileError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
