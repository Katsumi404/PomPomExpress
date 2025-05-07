import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from'@/contexts/ConfigContext';
import { RelicCard, PaginationControls, setOnPressFavorite } from '@/components/optimizerComponents/RelicComponents'; // Named imports from RelicComponents
import RelicDetailsModal from '@/components/optimizerComponents/RelicDetailsModal';

// Define interfaces for our data structures
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
  // Add additional fields from the full relic
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

export default function OptimizerScreen(): JSX.Element {
  const [userRelics, setUserRelics] = useState<UserRelic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserRelic, setSelectedUserRelic] = useState<UserRelic | null>(null);
  const [selectedRelicDetails, setSelectedRelicDetails] = useState<RelicDetails | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [updatingRelic, setUpdatingRelic] = useState<boolean>(false);
  const [removingRelic, setRemovingRelic] = useState<boolean>(false);

  const { user } = useAuth();
  const { apiUrl } = useConfig();

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 5;
  const maxRelicLevel = 15;

  const fetchUserRelics = useCallback(async (): Promise<void> => {
    if (!user || !user.id) {
      setError("User not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
      setIsLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to fetch your relics. Please try again later.');
      setIsLoading(false);
    }
  }, [apiUrl, user]);

  useEffect(() => {
    fetchUserRelics();
  }, [fetchUserRelics]);

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
      setError('Failed to fetch relic details. Please try again later.');
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
  }, [toggleFavorite]);

  // Get current page items
  const getCurrentPageItems = (): UserRelic[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return userRelics.slice(startIndex, endIndex);
  };

  const EmptyCollection = (): JSX.Element => (
    <ThemedView style={styles.emptyContainer}>
      <IconSymbol name="box-open" size={80} color="#808080" />
      <ThemedText style={styles.emptyText}>Your relic collection is empty</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Visit the Relics screen to add some relics to your collection
      </ThemedText>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="user-shield"
          style={styles.headerImage}
        />
      }
    >
      {isLoading ? (
        <ThemedView style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007BFF" />
          <ThemedText style={styles.loadingText}>Loading your relics...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : userRelics.length === 0 ? (
        <EmptyCollection />
      ) : (
        <ThemedView style={styles.container}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">My Relic Collection</ThemedText>
          </ThemedView>

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

      <RelicDetailsModal
        relic={selectedRelicDetails}
        userRelic={selectedUserRelic}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUpdateRelic={updateUserRelic}
        onRemoveRelic={removeUserRelic}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  container: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    height: 300,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    color: 'red',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    height: 400,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    color: '#808080',
  },
});