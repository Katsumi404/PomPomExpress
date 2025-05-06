import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if the user is not authenticated
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ProtectedRoute> {/* Ensure the ProtectedRoute wraps the entire Tab Navigation */}
      <Tabs
        initialRouteName="profileScreen"  // Set Profile as the default tab
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="profileScreen"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="characterScreen"
          options={{
            title: 'Characters',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="group.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="lightConeScreen"
          options={{
            title: 'LightCones',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
          }}
        />
        <Tabs.Screen
          name="calculatorScreen"
          options={{
            title: 'Calculator',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.slash.minus" color={color} />,
          }}
        />
        <Tabs.Screen
          name="optimiserScreen"
          options={{
            title: 'Optimizer',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}