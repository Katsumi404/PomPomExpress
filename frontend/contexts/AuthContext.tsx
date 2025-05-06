import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConfig } from './ConfigContext'; 

// Define User interface
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
}

// Define AuthContext Type
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (firstName: string, lastName: string, email: string, password: string, birthday: string) => Promise<User>;
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
  const { apiUrl } = useConfig();  
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
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Automatically get profile when token and user data are loaded
          await getProfile();
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
  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    birthday: string
  ): Promise<User> => {
    try {
      setError(null);
      setLoading(true);
  
      // Clean inputs
      const sanitizedData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password, 
        birthday: birthday.trim()
      };
  
      const response = await axios.post(
        `${apiUrl}/auth/register`,  // Use apiUrl from ConfigContext
        sanitizedData, 
        {
          headers: {
            'Content-Type': 'application/json', 
          },
        }
      );
  
      if (response.data && response.data.success && response.data.token && response.data.user) {
        const { token, user } = response.data;
  
        setToken(token);
        setUser(user);
  
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
  
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
        return user;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Registration error details:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Registration failed');
      } else {
        setError(error.message || 'Registration failed');
      }
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
      
      const response = await axios.post<{ token: string; user: User; success: boolean }>(`${apiUrl}/auth/login`, {
        email: email.toLowerCase(), 
        password
      });
      
      if (response.data && response.data.success && response.data.token && response.data.user) {
        const { token, user } = response.data;
        
        setToken(token);
        setUser(user);
        
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return user;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data?.message || 'Login failed');
      } else {
        setError(error.message || 'Login failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
      
      delete axios.defaults.headers.common['Authorization'];
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Get user profile function
  const getProfile = async (): Promise<User> => {
    try {
      setLoading(true);
      const response = await axios.get<User>(`${apiUrl}/auth/profile`);
      
      setUser(response.data);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      if (error.response?.status === 401) {
        await logout();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

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