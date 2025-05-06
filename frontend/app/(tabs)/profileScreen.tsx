import React, { useEffect } from 'react';
import { StyleSheet, Image, Button, ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Define the user interface
interface User {
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  profilePicture?: string;
}

// Define the auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  getProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export default function ProfileScreen(): JSX.Element {
  const { user, loading, getProfile, logout } = useAuth() as AuthContextType;
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  useEffect(() => {
    // Fetch user profile only if it's not already loaded
    if (!user && !loading) {
      getProfile().catch((error: Error) => {
        console.error('Failed to fetch user profile:', error);
      });
    }
  }, [user, loading, getProfile]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={themeColors.tint} />
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={[styles.errorMessage, { color: Colors.danger }]}>
          User not found. Please log in again.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        {user.profilePicture ? (
          <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.placeholderImage]} />
        )}
        <View style={styles.userInfo}>
          <ThemedText type="title" style={styles.userName}>
            {user.firstName} {user.lastName}
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.userEmail}>
            {user.email}
          </ThemedText>
          <ThemedText type="default" style={styles.userBirthday}>
            🎂 Birthday: {user.birthday}
          </ThemedText>
        </View>
      </View>

      {/* Edit Profile Button */}
      <Button 
        title="Edit Profile"
        onPress={() => console.log('Navigate to Edit Profile Screen')}
        color={Colors.primary}
      />

      <View style={styles.logoutContainer}>
        <Button 
          title="Logout"
          onPress={async () => await logout()}
          color={Colors.danger}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  placeholderImage: {
    backgroundColor: '#ccc',
  },
  userInfo: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 22,
  },
  userEmail: {
    fontSize: 14,
  },
  userBirthday: {
    fontSize: 14,
    marginTop: 4,
  },
  logoutContainer: {
    marginTop: 20,
  },
  errorMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 30,
  },
});
