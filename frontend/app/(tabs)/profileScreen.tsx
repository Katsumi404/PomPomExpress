import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet,  Button, ActivityIndicator, View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/contexts/ConfigContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { RelicCard, PaginationControls as RelicPaginationControls, setOnPressFavorite as setOnPressRelicFavorite } from '@/components/relics/RelicComponents';
import { CharacterCard, PaginationControls as CharacterPaginationControls, setOnPressFavorite as setOnPressCharacterFavorite, UserCharacter, CharacterDetails } from '@/components/characters/CharacterComponents';
import RelicDetailsModal from '@/components/relics/RelicDetailsModal';
import CharacterDetailsModal from '@/components/characters/CharacterDetailsModal';
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
  updateProfile?: (profileData: Partial<User>) => Promise<boolean>;
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
  const router = useRouter();

  // Tab state to switch between relics and characters
  const [activeTab, setActiveTab] = useState<'relics' | 'characters'>('relics');

  // Relic state variables
  const [userRelics, setUserRelics] = useState<UserRelic[]>([]);
  const [isLoadingRelics, setIsLoadingRelics] = useState<boolean>(true);
  const [relicError, setRelicError] = useState<string | null>(null);
  const [selectedUserRelic, setSelectedUserRelic] = useState<UserRelic | null>(null);
  const [selectedRelicDetails, setSelectedRelicDetails] = useState<RelicDetails | null>(null);
  const [relicModalVisible, setRelicModalVisible] = useState<boolean>(false);
  const [updatingRelic, setUpdatingRelic] = useState<boolean>(false);
  const [removingRelic, setRemovingRelic] = useState<boolean>(false);

  // Character state variables
  const [userCharacters, setUserCharacters] = useState<UserCharacter[]>([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState<boolean>(true);
  const [characterError, setCharacterError] = useState<string | null>(null);
  const [selectedUserCharacter, setSelectedUserCharacter] = useState<UserCharacter | null>(null);
  const [selectedCharacterDetails, setSelectedCharacterDetails] = useState<CharacterDetails | null>(null);
  const [characterModalVisible, setCharacterModalVisible] = useState<boolean>(false);
  const [updatingCharacter, setUpdatingCharacter] = useState<boolean>(false);
  const [removingCharacter, setRemovingCharacter] = useState<boolean>(false);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Pagination state for relics
  const [relicCurrentPage, setRelicCurrentPage] = useState<number>(1);
  const [relicTotalPages, setRelicTotalPages] = useState<number>(1);
  const relicsPerPage = 3;

  // Pagination state for characters
  const [characterCurrentPage, setCharacterCurrentPage] = useState<number>(1);
  const [characterTotalPages, setCharacterTotalPages] = useState<number>(1);
  const charactersPerPage = 3;

  // Navigate to edit profile screen
  const navigateToEditProfile = () => {
    router.push('../editProfileScreen');
  };

  // Refresh profile and collections data
  const refreshProfileData = async () => {
    setIsRefreshing(true);
    try {
      await getProfile();
      if (user && user.id) {
        await fetchUserRelics();
        await fetchUserCharacters();
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

  // RELICS SECTION
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
      setRelicTotalPages(Math.ceil(relicsWithDetails.length / relicsPerPage));
      setRelicCurrentPage(1); // Reset to first page when data is loaded
      setIsLoadingRelics(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setRelicError('Failed to fetch your relics. Please try again later.');
      setIsLoadingRelics(false);
    }
  }, [apiUrl, user]);

  const fetchRelicDetails = async (relicId: string, userRelic: UserRelic): Promise<void> => {
    try {
      // We already have basic info in userRelic, but fetch complete details for the modal
      const response = await axios.get<RelicDetails>(`${apiUrl}/db/getRelics/${relicId}`, {
        timeout: 5000,
      });
      setSelectedRelicDetails(response.data);
      setSelectedUserRelic(userRelic);
      setRelicModalVisible(true);
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

      setRelicModalVisible(false); // Close the modal after removing
      Alert.alert('Success', 'Relic has been removed from your collection.');
      setRemovingRelic(false);
    } catch (error) {
      console.error('Remove relic error:', error);
      Alert.alert('Error', 'Failed to remove relic from your collection. Please try again later.');
      setRemovingRelic(false);
    }
  };

  // Handle relic page change
  const handleRelicPageChange = (page: number): void => {
    setRelicCurrentPage(page);
  };

  // Toggle relic favorite status
  const toggleRelicFavorite = (id: string, currentStatus: boolean): void => {
    updateUserRelic(id, { isFavorite: !currentStatus });
  };

  // Get current page relic items
  const getCurrentPageRelics = (): UserRelic[] => {
    const startIndex = (relicCurrentPage - 1) * relicsPerPage;
    const endIndex = startIndex + relicsPerPage;
    return userRelics.slice(startIndex, endIndex);
  };

  // CHARACTERS SECTION
  const fetchUserCharacters = useCallback(async (): Promise<void> => {
    if (!user || !user.id) {
      setCharacterError("User not authenticated. Please log in.");
      setIsLoadingCharacters(false);
      return;
    }

    try {
      setIsLoadingCharacters(true);
      // Fetch user's characters collection
      const response = await axios.get<UserCharacter[]>(`${apiUrl}/users/getUserCharacters/${user.id}`, {
        timeout: 5000,
      });

      // For each user character, fetch the complete character details and merge them
      const charactersWithDetails = await Promise.all(
        response.data.map(async (userCharacter) => {
          try {
            const detailsResponse = await axios.get<CharacterDetails>(
              `${apiUrl}/db/getCharacters/${userCharacter.characterId}`,
              { timeout: 3000 }
            );
            console.log(user)

            // Merge user character data with full character details
            return {
              ...userCharacter,
              name: detailsResponse.data.name || "Unknown Character",
              element: detailsResponse.data.element,
              weaponType: detailsResponse.data.weaponType,
              description: detailsResponse.data.description,
              imageUrl: detailsResponse.data.imageUrl,
              stats: detailsResponse.data.stats,
              // Ensure we keep user-specific properties
              rarity: detailsResponse.data.rarity || userCharacter.rarity,
            };
          } catch (error) {
            console.warn(`Failed to fetch details for character ${userCharacter.characterId}:`, error);
            // Return original userCharacter if we can't get details
            return userCharacter;
          }
        })
      );

      setUserCharacters(charactersWithDetails);
      // Calculate total pages
      setCharacterTotalPages(Math.ceil(charactersWithDetails.length / charactersPerPage));
      setCharacterCurrentPage(1); // Reset to first page when data is loaded
      setIsLoadingCharacters(false);
    } catch (error) {
      console.error('Fetch characters error:', error);
      setCharacterError('Failed to fetch your characters. Please try again later.');
      setIsLoadingCharacters(false);
    }
  }, [apiUrl, user]);

  const fetchCharacterDetails = async (characterId: string, userCharacter: UserCharacter): Promise<void> => {
    try {
      // We already have basic info in userCharacter, but fetch complete details for the modal
      const response = await axios.get<CharacterDetails>(
        `${apiUrl}/db/getCharacters/${characterId}`,
        { timeout: 5000 }
      );
      setSelectedCharacterDetails(response.data);
      setSelectedUserCharacter(userCharacter);
      setCharacterModalVisible(true);
    } catch (error) {
      console.error('Fetch character details error:', error);
      setCharacterError('Failed to fetch character details. Please try again later.');
    }
  };

  // Update character in user's collection
  const updateUserCharacter = async (id: string, updates: Partial<UserCharacter>): Promise<void> => {
    if (!user || !user.id) {
      Alert.alert('Authentication Required', 'Please log in to update characters in your collection.');
      return;
    }

    try {
      setUpdatingCharacter(true);

      await axios.put(`${apiUrl}/users/updateUserCharacter/${id}`, {
        userId: user.id,
        ...updates
      }, {
        timeout: 5000
      });

      // Update the local state to reflect changes
      setUserCharacters(prev => prev.map(character =>
        character._id === id ? { ...character, ...updates } : character
      ));

      Alert.alert('Success', 'Character has been updated in your collection!');
      setUpdatingCharacter(false);
    } catch (error) {
      console.error('Update character error:', error);
      Alert.alert('Error', 'Failed to update character in your collection. Please try again later.');
      setUpdatingCharacter(false);
    }
  };

  // Remove character from user's collection
  const removeUserCharacter = async (characterId: string): Promise<void> => {
    if (!user || !user.id) {
      Alert.alert('Authentication Required', 'Please log in to remove characters from your collection.');
      return;
    }

    try {
      setRemovingCharacter(true);

      await axios.delete(`${apiUrl}/users/removeCharacterFromCollection/${user.id}/${characterId}`, {
        timeout: 5000
      });

      // Update the local state to remove the deleted character
      setUserCharacters(prev => prev.filter(character => character._id !== characterId));

      setCharacterModalVisible(false); // Close the modal after removing
      Alert.alert('Success', 'Character has been removed from your collection.');
      setRemovingCharacter(false);
    } catch (error) {
      console.error('Remove character error:', error);
      Alert.alert('Error', 'Failed to remove character from your collection. Please try again later.');
      setRemovingCharacter(false);
    }
  };

  // Handle character page change
  const handleCharacterPageChange = (page: number): void => {
    setCharacterCurrentPage(page);
  };

  // Toggle character favorite status
  const toggleCharacterFavorite = (id: string, currentStatus: boolean): void => {
    updateUserCharacter(id, { isFavorite: !currentStatus });
  };

  // Get current page character items
  const getCurrentPageCharacters = (): UserCharacter[] => {
    const startIndex = (characterCurrentPage - 1) * charactersPerPage;
    const endIndex = startIndex + charactersPerPage;
    return userCharacters.slice(startIndex, endIndex);
  };

  // Set up favorite handlers when component mounts
  useEffect(() => {
    setOnPressRelicFavorite(toggleRelicFavorite);
    setOnPressCharacterFavorite(toggleCharacterFavorite);
  }, []);

  // Fetch data when user is loaded
  useEffect(() => {
    if (user && user.id) {
      fetchUserRelics();
      fetchUserCharacters();
    }
  }, [fetchUserRelics, fetchUserCharacters, user]);

  const EmptyCollection = ({ type }: { type: 'relics' | 'characters' }): JSX.Element => (
    <ThemedView style={styles.emptyContainer}>
      <IconSymbol name="box-open" size={60} color="#808080" />
      <ThemedText style={styles.emptyText}>
        Your {type} collection is empty
      </ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Visit the {type === 'relics' ? 'Relics' : 'Characters'} screen to add some {type} to your collection
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
          <Button 
            title="Edit Profile" 
            onPress={navigateToEditProfile} 
            color={Colors.primary}
          />
        </View>

        {/* Collection Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'relics' && styles.activeTabButton]} 
            onPress={() => setActiveTab('relics')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'relics' && styles.activeTabText]}>
              Relics
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'characters' && styles.activeTabButton]} 
            onPress={() => setActiveTab('characters')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'characters' && styles.activeTabText]}>
              Characters
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Relics Collection */}
        {activeTab === 'relics' && (
          <ThemedView style={styles.collectionSection}>
            <ThemedView style={styles.sectionHeader}>
              <Button 
                title="Refresh Relics" 
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
              <EmptyCollection type="relics" />
            ) : (
              <ThemedView style={styles.collectionContainer}>
                {getCurrentPageRelics().map((relic) => (
                  <RelicCard
                    key={relic._id}
                    relic={relic}
                    onPress={() => fetchRelicDetails(relic.relicId, relic)}
                  />
                ))}

                {/* Pagination controls */}
                {userRelics.length > relicsPerPage && (
                  <RelicPaginationControls
                    currentPage={relicCurrentPage}
                    totalPages={relicTotalPages}
                    onPageChange={handleRelicPageChange}
                  />
                )}
              </ThemedView>
            )}
          </ThemedView>
        )}

        {/* Characters Collection */}
        {activeTab === 'characters' && (
          <ThemedView style={styles.collectionSection}>
            <ThemedView style={styles.sectionHeader}>
              <Button 
                title="Refresh Characters" 
                onPress={fetchUserCharacters} 
                color={Colors.primary}
              />
            </ThemedView>

            {isLoadingCharacters ? (
              <ThemedView style={styles.centerContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <ThemedText style={styles.loadingText}>Loading your characters...</ThemedText>
              </ThemedView>
            ) : characterError ? (
              <ThemedView style={styles.centerContent}>
                <ThemedText style={styles.errorText}>{characterError}</ThemedText>
              </ThemedView>
            ) : userCharacters.length === 0 ? (
              <EmptyCollection type="characters" />
            ) : (
              <ThemedView style={styles.collectionContainer}>
                {getCurrentPageCharacters().map((character) => (
                  <CharacterCard
                    key={character._id}
                    character={character}
                    onPress={() => fetchCharacterDetails(character.characterId, character)}
                  />
                ))}

                {/* Pagination controls */}
                {userCharacters.length > charactersPerPage && (
                  <CharacterPaginationControls
                    currentPage={characterCurrentPage}
                    totalPages={characterTotalPages}
                    onPageChange={handleCharacterPageChange}
                  />
                )}
              </ThemedView>
            )}
          </ThemedView>
        )}

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
          visible={relicModalVisible}
          onClose={() => setRelicModalVisible(false)}
          onUpdateRelic={updateUserRelic}
          onRemoveRelic={removeUserRelic}
        />

        {/* Character Details Modal */}
        <CharacterDetailsModal
          character={selectedCharacterDetails}
          userCharacter={selectedUserCharacter}
          visible={characterModalVisible}
          onClose={() => setCharacterModalVisible(false)}
          onUpdateCharacter={updateUserCharacter}
          onRemoveCharacter={removeUserCharacter}
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  activeTabButton: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  collectionSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  collectionContainer: {
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