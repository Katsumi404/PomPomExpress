import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define User interface
interface User {
  id: string;
  name: string;
  email: string;
}

// Define AuthContext Type
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User>;
}

// Create the Auth Context with default values
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Define Props for the Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from storage
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as User);
          
          // Set token in axios headers for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error('Failed to load auth info from storage:', e);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Register function
  const register = async (name: string, email: string, password: string): Promise<User> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post<{ token: string; user: User }>('http://10.202.129.194:3000/auth/register', {
        name,
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Save to state
      setToken(token);
      setUser(user);
      
      // Save to storage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post<{ token: string; user: User }>('http://10.202.132.225:3000/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Save to state
      setToken(token);
      setUser(user);
      
      // Save to storage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Clear state
      setToken(null);
      setUser(null);
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Get user profile function
  const getProfile = async (): Promise<User> => {
    try {
      setLoading(true);
      const response = await axios.get<User>('http://10.202.132.225:3000/auth/profile');
      setUser(response.data);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      if (error.response?.status === 401) {
        // Token might be expired, logout user
        await logout();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Provide auth values and functions
  const authContextValue: AuthContextType = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    getProfile,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
