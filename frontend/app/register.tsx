import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen(): JSX.Element {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const { register, loading } = useAuth();
  const router = useRouter();

  // Date validation function
  const isValidDate = (dateString: string): boolean => {
    // Check if the date string is in YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return (
      date instanceof Date &&
      !isNaN(date.getTime())
    );
  };

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const handleRegister = async (): Promise<void> => {
    setErrorMsg('');

    // Check for empty fields
    if (!firstName || !lastName || !email || !password || !birthday) {
      const missingFields = [];
      if (!firstName) missingFields.push('First Name');
      if (!lastName) missingFields.push('Last Name');
      if (!email) missingFields.push('Email');
      if (!password) missingFields.push('Password');
      if (!birthday) missingFields.push('Birthday');
      
      const errorMessage = `Please fill in all fields. Missing: ${missingFields.join(', ')}`;
      setErrorMsg(errorMessage);
      Alert.alert('Missing Information', errorMessage);
      return;
    }

    // Validate email
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address');
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    // Check passwords match
    if (password !== confirmPassword.trim()) {
      setErrorMsg('Passwords do not match');
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    // Validate date
    if (!isValidDate(birthday)) {
      setErrorMsg('Please enter a valid birthday in YYYY-MM-DD format');
      Alert.alert('Invalid Date', 'Please enter a valid birthday in YYYY-MM-DD format');
      return;
    }

    try {
      console.log("Attempting registration with:", {
        firstName: firstName,
        lastName: lastName,
        email: email,
        birthday: birthday,
        password: password
      });
      
      // Use trimmed values when calling register
      await register(
        firstName, 
        lastName, 
        email, 
        password, 
        birthday
      );
      
      console.log("Registration successful, redirecting to home");
      router.replace('../(tabs)/profileScreen');
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Get detailed error information
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        console.error('Server response:', {
          status: error.response.status,
          data: error.response.data
        });
        
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
        
        // Handle common error cases
        if (error.response.status === 400 && 
            error.response.data?.message?.includes('already exists')) {
          errorMessage = 'This email is already registered.';
        }
      }
      
      setErrorMsg(errorMessage);
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText type="title" style={styles.title}>Create Account</ThemedText>

        {errorMsg ? <ThemedText style={styles.errorText}>{errorMsg}</ThemedText> : null}

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Birthday (YYYY-MM-DD)"
            value={birthday}
            onChangeText={setBirthday}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Register</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <ThemedText style={styles.linkText}>Already have an account? Login</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    height: 50,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#007BFF',
  }
});