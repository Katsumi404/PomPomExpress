import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, ActivityIndicator, View, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/contexts/ConfigContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  getProfile: () => Promise<void>;
}

export default function EditProfileScreen(): JSX.Element {
  const { user, loading, getProfile } = useAuth() as AuthContextType;
  const { apiUrl } = useConfig();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const router = useRouter();

  // Form state
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Format date for display (YYYY-MM-DD for input)
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  // Load user data into form fields
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setBirthday(user.birthday ? formatDateForInput(user.birthday) : '');
    }
  }, [user]);

  // Update profile using the auth/updateProfile endpoint
  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    if (!user || !user.id) {
      return false;
    }

    try {
      const response = await axios.put(
        `${apiUrl}/auth/updateProfile`,
        {
          userId: user.id,
          ...profileData
        },
        {
          timeout: 5000
        }
      );
      
      if (response.status === 200) {
        // Refresh user profile data
        await getProfile();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !birthday) {
      setFormError('All fields are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    // Birthday validation
    const birthdayDate = new Date(birthday);
    if (isNaN(birthdayDate.getTime())) {
      setFormError('Please enter a valid date');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Call the updateProfile function
      const profileData = {
        firstName,
        lastName,
        email,
        birthday
      };
      
      const success = await updateProfile(profileData);
      
      if (success) {
        Alert.alert(
          'Success', 
          'Your profile has been updated successfully!',
          [{ text: 'OK', onPress: () => router.push('../profileScreen') }]
        );
      } else {
        setFormError('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setFormError('An error occurred while updating your profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={themeColors.tint} />
        <ThemedText style={styles.loadingText}>Loading your profile...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={[styles.errorMessage, { color: Colors.danger }]}>
          User not found. Please log in again.
        </ThemedText>
        <Button 
          title="Go Back" 
          onPress={() => router.back()}
          color={Colors.primary}
        />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <IconSymbol
            size={40}
            color={themeColors.tint}
            name="user-edit"  
            style={styles.headerIcon}
          />
          <ThemedText type="title" style={styles.headerTitle}>
            Edit Profile
          </ThemedText>
        </View>

        {formError && (
          <ThemedText style={styles.errorText}>{formError}</ThemedText>
        )}

        <ThemedView style={styles.formContainer}>
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>First Name</ThemedText>
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor={themeColors.placeholderText}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Last Name</ThemedText>
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor={themeColors.placeholderText}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={themeColors.placeholderText}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Birthday</ThemedText>
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              value={birthday}
              onChangeText={setBirthday}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={themeColors.placeholderText}
            />
          </ThemedView>
        </ThemedView>

        <View style={styles.buttonContainer}>
          <Button
            title={isSubmitting ? "Saving..." : "Save Changes"}
            onPress={handleSubmit}
            disabled={isSubmitting}
            color={Colors.primary}
          />
          
          <View style={styles.cancelButtonContainer}>
            <Button
              title="Cancel"
              onPress={() => router.push('../profileScreen')}
              color={Colors.secondary}
            />
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  cancelButtonContainer: {
    marginTop: 16,
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
});