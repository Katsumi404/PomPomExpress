import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfileScreen() {
  const { user, loading, getProfile, logout } = useAuth();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  useEffect(() => {
    if (!user && !loading) {
      getProfile().catch((error) => {
        console.error('Failed to fetch user profile:', error);
      });
    }
  }, [user, loading, getProfile]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}> 
        <ActivityIndicator size="large" color={themeColors.tint} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}> 
        <Text style={[styles.errorMessage, { color: Colors.danger }]}>User not found. Please log in again.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}> 
      <View style={styles.header}>
        <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: themeColors.text }]}>{user.name}</Text>
          <Text style={[styles.userEmail, { color: themeColors.secondaryText }]}>{user.email}</Text>
        </View>
      </View>
      
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
    </View>
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
  userInfo: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
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
