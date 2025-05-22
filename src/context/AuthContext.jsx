import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Test credentials
const TEST_CREDENTIALS = {
  email: 'wajeeh.hassan@barontechs.com',
  password: 'admin123',
  name: 'Admin User'
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
  }, []);

  const signIn = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check credentials
      if (credentials.email === TEST_CREDENTIALS.email && 
          credentials.password === TEST_CREDENTIALS.password) {
        const userData = { 
          email: credentials.email,
          name: TEST_CREDENTIALS.name
        };
        setUser(userData);
        setIsAuthenticated(true);
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      setError(error.message);
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