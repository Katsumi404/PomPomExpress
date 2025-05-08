import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Image, Button, ActivityIndicator, View, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/contexts/ConfigContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { RelicCard, PaginationControls, setOnPressFavorite } from '@/components/relics/RelicComponents';
import RelicDetailsModal from '@/components/relics/RelicDetailsModal';
import { useRouter } from 'expo-router'; 

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
  logout: () => Promise<void>;
  updateProfile?: (profileData: Partial<User>) => Promise<boolean>; // Add updateProfile to the interface
}

// Define interfaces for relic data structures
interface Stats {
  [key: string]: number;
}

interface UserRelic {
  _id: string;
  relicId: string;
  name: string;
  rarity: number;
  mainStats: Stats;
  subStats: Stats;
  level: number;
  isFavorite: boolean;
  dateAdded: string;
  // Additional fields from the full relic
  setName?: string;
  description?: string;
  imageUrl?: string;
}

interface RelicDetails {
  _id: string;
  name: string;
  setName?: string;
  rarity: number;
  description?: string;
  mainStats?: Stats;
  subStats?: Stats;
  tags?: Array<{id: string, name: string}>;
  releaseDate?: string;
  imageUrl?: string;
  schemaVersion?: string;
  updatedAt?: string | null;
}

export default function ProfileScreen(): JSX.Element {
  const { user, loading, getProfile, logout } = useAuth() as AuthContextType;
  const { apiUrl } = useConfig();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const router = useRouter(); // Initialize router

  // Relic state variables
  const [userRelics, setUserRelics] = useState<UserRelic[]>([]);
  const [isLoadingRelics, setIsLoadingRelics] = useState<boolean>(true);
  const [relicError, setRelicError] = useState<string | null>(null);
  const [selectedUserRelic, setSelectedUserRelic] = useState<UserRelic | null>(null);
  const [selectedRelicDetails, setSelectedRelicDetails] = useState<RelicDetails | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [updatingRelic, setUpdatingRelic] = useState<boolean>(false);
  const [removingRelic, setRemovingRelic] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // Add refresh state

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 3; // Reduced from 5 to better fit in profile view

  // Navigate to edit profile screen
  const navigateToEditProfile = () => {
    router.push('/profile/editProfileScreen');
  };

  // Refresh profile and relics data
  const refreshProfileData = async () => {
    setIsRefreshing(true);
    try {
      await getProfile();
      if (user && user.id) {
        await fetchUserRelics();
      }
    } catch (error) {
      console.error('Failed to refresh profile data:', error);
      Alert.alert('Error', 'Failed to refresh profile data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Fetch user profile only if it's not already loaded
    if (!user && !loading) {
      getProfile().catch((error: Error) => {
        console.error('Failed to fetch user profile:', error);
      });
    }
  }, [user, loading, getProfile]);

  // Function to format the birthday date
  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(formattedDate);
  };

  const fetchUserRelics = useCallback(async (): Promise<void> => {
    if (!user || !user.id) {
      setRelicError("User not authenticated. Please log in.");
      setIsLoadingRelics(false);
      return;
    }

    try {
      setIsLoadingRelics(true);
      // Fetch user's relics collection
      const response = await axios.get<UserRelic[]>(`${apiUrl}/users/getUserRelics/${user.id}`, {
        timeout: 5000,
      });

      // For each user relic, fetch the complete relic details and merge them
      const relicsWithDetails = await Promise.all(
        response.data.map(async (userRelic) => {
          try {
            const detailsResponse = await axios.get<RelicDetails>(
              `${apiUrl}/db/getRelics/${userRelic.relicId}`,
              { timeout: 3000 }
            );

            // Merge user relic data with full relic details
            return {
              ...userRelic,
              name: detailsResponse.data.name || "Unknown Relic",
              setName: detailsResponse.data.setName,
              description: detailsResponse.data.description,
              imageUrl: detailsResponse.data.imageUrl,
              // Ensure we keep user-specific properties
              rarity: detailsResponse.data.rarity || userRelic.rarity,
            };
          } catch (error) {
            console.warn(`Failed to fetch details for relic ${userRelic.relicId}:`, error);
            // Return original userRelic if we can't get details
            return userRelic;
          }
        })
      );

      setUserRelics(relicsWithDetails);
      // Calculate total pages
      setTotalPages(Math.ceil(relicsWithDetails.length / itemsPerPage));
      setCurrentPage(1); // Reset to first page when data is loaded
      setIsLoadingRelics(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setRelicError('Failed to fetch your relics. Please try again later.');
      setIsLoadingRelics(false);
    }
  }, [apiUrl, user]);

  useEffect(() => {
    if (user && user.id) {
      fetchUserRelics();
    }
  }, [fetchUserRelics, user]);

  const fetchRelicDetails = async (relicId: string, userRelic: UserRelic): Promise<void> => {
    try {
      // We already have basic info in userRelic, but fetch complete details for the modal
      const response = await axios.get<RelicDetails>(`${apiUrl}/db/getRelics/${relicId}`, {
        timeout: 5000,
      });
      setSelectedRelicDetails(response.data);
      setSelectedUserRelic(userRelic);
      setModalVisible(true);
    } catch (error) {
      console.error('Fetch relic details error:', error);
      setRelicError('Failed to fetch relic details. Please try again later.');
    }
  };

  // Update relic in user's collection
  const updateUserRelic = async (id: string, updates: Partial<UserRelic>): Promise<void> => {
    if (!user || !user.id) {
      Alert.alert('Authentication Required', 'Please log in to update relics in your collection.');
      return;
    }

    try {
      setUpdatingRelic(true);

      await axios.put(`${apiUrl}/users/updateUserRelic/${id}`, {
        userId: user.id,
        ...updates
      }, {
        timeout: 5000
      });

      // Update the local state to reflect changes
      setUserRelics(prev => prev.map(relic =>
        relic._id === id ? { ...relic, ...updates } : relic
      ));

      Alert.alert('Success', 'Relic has been updated in your collection!');
      setUpdatingRelic(false);
    } catch (error) {
      console.error('Update relic error:', error);
      Alert.alert('Error', 'Failed to update relic in your collection. Please try again later.');
      setUpdatingRelic(false);
    }
  };

  // Remove relic from user's collection
  const removeUserRelic = async (relicId: string): Promise<void> => {
    if (!user || !user.id) {
      Alert.alert('Authentication Required', 'Please log in to remove relics from your collection.');
      return;
    }

    try {
      setRemovingRelic(true);

      await axios.delete(`${apiUrl}/users/removeRelicFromCollection/${user.id}/${relicId}`, {
        timeout: 5000
      });

      // Update the local state to remove the deleted relic
      setUserRelics(prev => prev.filter(relic => relic._id !== relicId));

      setModalVisible(false); // Close the modal after removing
      Alert.alert('Success', 'Relic has been removed from your collection.');
      setRemovingRelic(false);
    } catch (error) {
      console.error('Remove relic error:', error);
      Alert.alert('Error', 'Failed to remove relic from your collection. Please try again later.');
      setRemovingRelic(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  // Toggle favorite status
  const toggleFavorite = (id: string, currentStatus: boolean): void => {
    updateUserRelic(id, { isFavorite: !currentStatus });
  };

  useEffect(() => {
    setOnPressFavorite(toggleFavorite);
  }, []);

  // Get current page items
  const getCurrentPageItems = (): UserRelic[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return userRelics.slice(startIndex, endIndex);
  };

  const EmptyCollection = (): JSX.Element => (
    <ThemedView style={styles.emptyContainer}>
      <IconSymbol name="box-open" size={60} color="#808080" />
      <ThemedText style={styles.emptyText}>Your relic collection is empty</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Visit the Relics screen to add some relics to your collection
      </ThemedText>
    </ThemedView>
  );

  if (loading || isRefreshing) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={themeColors.tint} />
        {isRefreshing && (
          <ThemedText style={styles.loadingText}>Refreshing profile data...</ThemedText>
        )}
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
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        {/* User Profile Section */}
        <View style={styles.header}>
          <IconSymbol
            size={50}
            color={themeColors.tint}
            name="user-circle" 
            style={styles.profileIcon}
          />
          <View style={styles.userInfo}>
            <ThemedText type="title" style={styles.userName}>
              {user.firstName} {user.lastName}
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.userEmail}>
              {user.email}
            </ThemedText>
            <ThemedText type="default" style={styles.userBirthday}>
              🎂 Birthday: {formatDate(user.birthday)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {/* Updated to use router navigation */}
          <Button 
            title="Edit Profile"
            onPress={navigateToEditProfile}
            color={Colors.primary}
          />
        </View>

        {/* Relics Section */}
        <ThemedView style={styles.relicsSection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="title">My Relic Collection</ThemedText>
            <Button 
              title="Refresh" 
              onPress={fetchUserRelics} 
              color={Colors.primary}
            />
          </ThemedView>

          {isLoadingRelics ? (
            <ThemedView style={styles.centerContent}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <ThemedText style={styles.loadingText}>Loading your relics...</ThemedText>
            </ThemedView>
          ) : relicError ? (
            <ThemedView style={styles.centerContent}>
              <ThemedText style={styles.errorText}>{relicError}</ThemedText>
            </ThemedView>
          ) : userRelics.length === 0 ? (
            <EmptyCollection />
          ) : (
            <ThemedView style={styles.relicsContainer}>
              {getCurrentPageItems().map((relic) => (
                <RelicCard
                  key={relic._id}
                  relic={relic}
                  onPress={() => fetchRelicDetails(relic.relicId, relic)}
                />
              ))}

              {/* Pagination controls */}
              {userRelics.length > itemsPerPage && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </ThemedView>
          )}
        </ThemedView>

        <View style={styles.actionButtonsContainer}>
          <Button 
            title="Refresh Profile" 
            onPress={refreshProfileData}
            color={Colors.secondary}
          />
          
          <View style={styles.logoutContainer}>
            <Button 
              title="Logout"
              onPress={async () => await logout()}
              color={Colors.danger}
            />
          </View>
        </View>

        {/* Relic Details Modal */}
        <RelicDetailsModal
          relic={selectedRelicDetails}
          userRelic={selectedUserRelic}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onUpdateRelic={updateUserRelic}
          onRemoveRelic={removeUserRelic}
        />
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
    marginBottom: 16,
    paddingTop: 20, // Adjusted to add spacing for top bar
  },
  profileIcon: {
    marginRight: 16,
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
  buttonContainer: {
    marginBottom: 24,
  },
  relicsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  relicsContainer: {
    gap: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    height: 160,
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    color: '#808080',
  },
  actionButtonsContainer: {
    marginTop: 8,
    marginBottom: 32,
    gap: 16,
  },
  logoutContainer: {
    marginTop: 8,
  },
  errorMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 30,
  },
});