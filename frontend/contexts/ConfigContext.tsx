import React, { createContext, useContext, ReactNode } from 'react';
import Config from 'react-native-config';

// Define the shape of context
interface AppConfig { 
  apiUrl: string;
}
const ConfigContext = createContext<AppConfig | undefined>(undefined);

// Default API URL
const DEFAULT_API_URL = 'http://10.202.134.121:3000';

// Provider component
export const ConfigProvider = ({ children }: { children: ReactNode }) => {

  // Determine the apiUrl, using the default if Config.API_BASE_URL is undefined
  const apiUrl = Config.API_BASE_URL ? Config.API_BASE_URL : DEFAULT_API_URL;

  const config: AppConfig = {
    apiUrl: apiUrl,
  };

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

// Hook for consuming
export const useConfig = (): AppConfig => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};