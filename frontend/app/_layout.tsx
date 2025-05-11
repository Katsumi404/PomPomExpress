import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component.',
  'Expected static flag was missing',
]);

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/contexts/AuthContext';
import { ConfigProvider } from '@/contexts/ConfigContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ConfigProvider>
        <AuthProvider>
         <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
           <Stack>
             <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
             <Stack.Screen name="+not-found" />
             <Stack.Screen name="login" options={{ title: 'Login' }} />
             <Stack.Screen name="register" options={{ title: 'Register' }} />
           </Stack>
           <StatusBar style="auto" />
         </ThemeProvider>
       </AuthProvider>
     </ConfigProvider>
  );
}