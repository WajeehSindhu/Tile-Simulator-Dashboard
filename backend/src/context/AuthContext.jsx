import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Hardcode the production API URL
const API_URL = 'https://live-backend-3.onrender.com';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add axios interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add CORS headers
    config.headers['Access-Control-Allow-Origin'] = '*';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - please check your connection and try again');
    }
    return Promise.reject(error);
  }
);

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
  const [tiles, setTiles] = useState([]);
  const [tileColors, setTileColors] = useState([]);
  const [colorLoading, setColorLoading] = useState(false);
  const [colorError, setColorError] = useState(null);
  const [tileCategories, setTileCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

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
      console.log('Attempting to sign in with:', API_URL);
      const response = await axios.post(`${API_URL}/api/signin`, {
        email: credentials.email,
        password: credentials.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      });

      const { user: userData, token } = response.data;
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error.response?.data?.message || "Sign in failed";
      setError(errorMessage);
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
        `${API_URL}/api/forgot-password`,
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
        `${API_URL}/api/reset-password/${token}`,
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

  const fetchTiles = async () => {
    setTileLoading(true);
    setTileError(null);
    try {
      const response = await axios.get(`${API_URL}/api/tiles`);
      setTiles(response.data);
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to fetch tiles";
      setTileError(errMsg);
    } finally {
      setTileLoading(false);
    }
  };

  const addTile = async (formData) => {
    setTileLoading(true);
    setTileError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/tiles`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setTiles(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to add tile";
      setTileError(errMsg);
      throw new Error(errMsg);
    } finally {
      setTileLoading(false);
    }
  };

  const updateTile = async (id, formData) => {
    setTileLoading(true);
    setTileError(null);
    try {
      const response = await axios.put(
        `${API_URL}/api/tiles/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setTiles(prev => prev.map(tile => tile._id === id ? response.data : tile));
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || "Failed to update tile";
      setTileError(errMsg);
      throw new Error(errMsg);
    } finally {
      setTileLoading(false);
    }
  };

  const deleteTile = async (id) => {
    setTileLoading(true);
    setTileError(null);
    try {
      await axios.delete(`${API_URL}/api/tiles/${id}`);
      setTiles(prev => prev.filter(tile => tile._id !== id));
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to delete tile";
      setTileError(errMsg);
      throw new Error(errMsg);
    } finally {
      setTileLoading(false);
    }
  };

  // ✅ Fetch Colors
  const fetchTileColors = async () => {
    setColorLoading(true);
    setColorError(null);
    try {
      const response = await axios.get(`${API_URL}/api/colors`);
      setTileColors(response.data);
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to fetch colors";
      setColorError(errMsg);
    } finally {
      setColorLoading(false);
    }
  };

  // ✅ Add New Color
  const addTileColor = async (hexCode) => {
    setColorLoading(true);
    setColorError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/colors/add`,
        { hexCode }
      );
      setTileColors((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to add color";
      setColorError(errMsg);
      throw new Error(errMsg);
    } finally {
      setColorLoading(false);
    }
  };

  // Delete Color
  const deleteTileColor = async (id) => {
    setColorLoading(true);
    setColorError(null);
    try {
      await axios.delete(`${API_URL}/api/colors/${id}`);
      setTileColors((prev) => prev.filter((color) => color._id !== id));
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to delete color";
      setColorError(errMsg);
      throw new Error(errMsg);
    } finally {
      setColorLoading(false);
    }
  };
  // Fetch Categories
  const fetchTileCategories = async () => {
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      setTileCategories(response.data);
    } catch (error) {
      const errMsg =
        error.response?.data?.error || "Failed to fetch categories";
      setCategoryError(errMsg);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Add Category
  const addTileCategory = async (formData) => {
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/categories`,
        formData
      );
      setTileCategories((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to add category";
      setCategoryError(errMsg);
      throw new Error(errMsg);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Update Category
  const updateTileCategory = async (id, formData) => {
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      const response = await axios.put(
        `${API_URL}/api/categories/${id}`,
        formData
      );
      setTileCategories((prev) =>
        prev.map((cat) => (cat._id === id ? response.data : cat))
      );
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to update category";
      setCategoryError(errMsg);
      throw new Error(errMsg);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Delete Category
  const deleteTileCategory = async (id) => {
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      await axios.delete(`${API_URL}/api/categories/${id}`);
      setTileCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to delete category";
      setCategoryError(errMsg);
      throw new Error(errMsg);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Update Color
  const updateTileColor = async (id, hexCode) => {
    setColorLoading(true);
    setColorError(null);
    try {
      const response = await axios.put(
        `${API_URL}/api/colors/${id}`,
        { hexCode }
      );
      setTileColors((prev) =>
        prev.map((color) => (color._id === id ? response.data : color))
      );
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to update color";
      setColorError(errMsg);
      throw new Error(errMsg);
    } finally {
      setColorLoading(false);
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
        tiles,
        fetchTiles,
        addTile,
        updateTile,
        deleteTile,
        tileLoading,
        tileError,
        tileColors,
        fetchTileColors,
        addTileColor,
        deleteTileColor,
        updateTileColor,
        colorLoading,
        colorError,
        tileCategories,
        categoryLoading,
        categoryError,
        fetchTileCategories,
        addTileCategory,
        updateTileCategory,
        deleteTileCategory,
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
