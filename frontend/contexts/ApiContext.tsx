import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { NetworkInfo } from 'react-native-network-info'; // To get the local IP address

// Define the shape of your API context
interface ApiContextType {
  isConnected: boolean;
  fetcher: (url: string, options?: RequestInit) => Promise<Response>;
  baseUrl: string;
  setBaseUrl: (url: string) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [baseUrl, setBaseUrl] = useState<string>('');

  // Function to determine device's local IP address
  const getLocalIp = async () => {
    try {
      const ip = await NetworkInfo.getIPAddress(); // Fetches the device's local IP
      return `http://${ip}:3000`; // Assume port 3000 for the API
    } catch (error) {
      console.error('Error getting local IP address:', error);
      return null;
    }
  };

  // Function to determine public IP using an external service
  const getExternalIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return `http://${data.ip}:3000`; // Assume port 3000 for the API
    } catch (error) {
      console.error('Error fetching external IP:', error);
      return null;
    }
  };

  // Update base URL (try local IP first, then fallback to public IP)
  const updateBaseUrl = async () => {
    const localIp = await getLocalIp();
    if (localIp) {
      setBaseUrl(localIp); // Set local IP as base URL
    } else {
      const externalIp = await getExternalIp();
      if (externalIp) {
        setBaseUrl(externalIp); // Set external IP as base URL if local fails
      }
    }
  };

  // Dynamically update the base URL when the component is mounted
  useEffect(() => {
    updateBaseUrl();
  }, []);

  // The fetcher function that uses the dynamically set base URL
  const fetcher = async (url: string, options?: RequestInit): Promise<Response> => {
    if (!isConnected) {
      throw new Error('No internet connection. Cannot perform API call.');
    }

    try {
      const response = await fetch(`${baseUrl}${url}`, options);
      if (!response.ok) {
        throw new Error(`Fetch failed with status ${response.status}`);
      }
      return response;
    } catch (err) {
      throw err;
    }
  };

  return (
    <ApiContext.Provider value={{ isConnected, fetcher, baseUrl, setBaseUrl }}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to access the API context
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
