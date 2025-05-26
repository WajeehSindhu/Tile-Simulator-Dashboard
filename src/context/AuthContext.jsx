import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
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
    const response = await axios.post('http://localhost:5000/api/signin', {
  email: credentials.email,
  password: credentials.password
});
   const userData = response.data;
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/dashboard');
  } catch (error) {
    setError(error.response?.data?.message || 'Sign in failed');
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const signOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Navigate to sign in
    navigate('/signin');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAuthChecked,
      isLoading,
      user,
      error,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 