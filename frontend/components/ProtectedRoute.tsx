import React, { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element | null {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false); // Track if navigation is ready

  useEffect(() => {
    // Wait until everything is loaded (loading finished and router is ready)
    if (!loading && !isReady) {
      setIsReady(true);
      console.log('✅ User authenticated:', user);
    }

    if (!loading && !user && isReady) {
      // Redirect to login if not authenticated and everything is ready
      router.replace('/login');
    }
  }, [user, loading, router, isReady]);

  if (loading || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? <>{children}</> : null;
}
