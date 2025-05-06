import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, View, Modal, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

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
}

interface RelicDetails {
  _id: string;
  name: string;
  setName?: string;
  rarity: number;
  description?: string;
  mainStats?: Stats;
  subStats?: Stats;
  tags?: string[];
  releaseDate?: string;
  imageUrl?: string;
  schemaVersion?: string;
  updatedAt?: string | null;
}

// Props interfaces
interface RelicCardProps {
  relic: UserRelic;
  onPress: () => void;
}

interface RelicDetailsModalProps {
  relic: RelicDetails | null;
  userRelic: UserRelic | null;
  visible: boolean;
  onClose: () => void;
  onUpdateRelic: (id: string, updates: Partial<UserRelic>) => void;
  onRemoveRelic: (id: string) => void;
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function UserRelicsScreen(): JSX.Element {
  const [userRelics, setUserRelics] = useState<UserRelic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserRelic, setSelectedUserRelic] = useState<UserRelic | null>(null);
  const [selectedRelicDetails, setSelectedRelicDetails] = useState<RelicDetails | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [updatingRelic, setUpdatingRelic] = useState<boolean>(false);
  const [removingRelic, setRemovingRelic] = useState<boolean>(false);

  // Auth context to get current user
  const { user } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 5;
  const maxRelicLevel = 15;

  const fetchUserRelics = async (): Promise<void> => {
    if (!user || !user.id) {
      setError("User not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Update the URL to match your API endpoint
      const response = await axios.get<UserRelic[]>(`http://10.202.134.121:3000/users/getUserRelics/${user.id}`, {
        timeout: 5000,
      });
      setUserRelics(response.data);
      // Calculate total pages
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      setCurrentPage(1); // Reset to first page when data is loaded
      setIsLoading(false);
      console.log("Fetched relics:", response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to fetch your relics. Please try again later.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRelics();
  }, [user]);

  const fetchRelicDetails = async (relicId: string, userRelic: UserRelic): Promise<void> => {
    try {
      // Update the URL to match your API endpoint for fetching a single relic
      const response = await axios.get<RelicDetails>(`http://10.202.134.121:3000/db/getRelics/${relicId}`, {
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

      await axios.put(`http://10.202.134.121:3000/users/updateUserRelic/${id}`, {
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

      await axios.delete(`http://10.202.134.121:3000/users/removeRelicFromCollection/${user.id}/${relicId}`, {
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

  // Get current page items
  const getCurrentPageItems = (): UserRelic[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return userRelics.slice(startIndex, endIndex);
  };

  const RelicCard = ({ relic, onPress }: RelicCardProps): JSX.Element => (
    <TouchableOpacity onPress={onPress}>
      <ThemedView style={styles.card}>
        <ThemedView style={styles.cardHeader}>
          <ThemedText type="title" style={styles.relicName}>
            {relic.name}
          </ThemedText>
          <TouchableOpacity
            onPress={() => toggleFavorite(relic._id, relic.isFavorite)}
            style={styles.favoriteButton}
          >
            <IconSymbol
              name={relic.isFavorite ? "star-filled" : "star"}
              size={20}
              color={relic.isFavorite ? "#FFD700" : "#808080"}
            />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.basicInfo}>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.rarity}>
              {"★".repeat(relic.rarity)}
            </ThemedText>
            <ThemedText style={styles.level}>
              Level: {relic.level}
            </ThemedText>
          </ThemedView>

          <ThemedText style={styles.dateAdded}>
            Added: {new Date(relic.dateAdded).toLocaleDateString()}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  const PaginationControls = ({ currentPage, totalPages, onPageChange }: PaginationControlsProps): JSX.Element => (
    <ThemedView style={styles.paginationContainer}>
      <TouchableOpacity
        onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
      >
        <ThemedText style={styles.paginationButtonText}>Previous</ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.paginationInfo}>
        <ThemedText style={styles.paginationLabel}>
          Page {currentPage} of {totalPages}
        </ThemedText>
      </ThemedView>

      <TouchableOpacity
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
      >
        <ThemedText style={styles.paginationButtonText}>Next</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  const RelicDetailsModal = ({
    relic,
    userRelic,
    visible,
    onClose,
    onUpdateRelic,
    onRemoveRelic
  }: RelicDetailsModalProps): JSX.Element | null => {
    if (!relic || !userRelic) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ScrollView>
              <ThemedText type="title" style={styles.modalTitle}>
                {relic.name}
              </ThemedText>

              {relic.imageUrl ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: relic.imageUrl }}
                    style={styles.relicImage}
                    resizeMode="contain"
                  />
                </View>
              ) : null}

              <ThemedView style={styles.detailsContainer}>
                {relic.setName && (
                  <ThemedView style={styles.detailRow}>
                    <ThemedText type="defaultSemiBold">Set:</ThemedText>
                    <ThemedText>{relic.setName}</ThemedText>
                  </ThemedView>
                )}

                <ThemedView style={styles.detailRow}>
                  <ThemedText type="defaultSemiBold">Rarity:</ThemedText>
                  <ThemedText>{"★".repeat(relic.rarity)}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <ThemedText type="defaultSemiBold">Level:</ThemedText>
                  <ThemedView style={styles.levelContainer}>
                    <ThemedText>{userRelic.level}/{maxRelicLevel}</ThemedText>
                    <TouchableOpacity
                      style={styles.levelUpButton}
                      onPress={() => onUpdateRelic(userRelic._id, { level: Math.min(userRelic.level + 1, maxRelicLevel) })}
                      disabled={userRelic.level >= maxRelicLevel || updatingRelic}
                    >
                      <ThemedText style={styles.levelUpButtonText}>Level Up</ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <ThemedText type="defaultSemiBold">Favorite:</ThemedText>
                  <TouchableOpacity
                    onPress={() => onUpdateRelic(userRelic._id, { isFavorite: !userRelic.isFavorite })}
                    disabled={updatingRelic}
                  >
                    <IconSymbol
                      name={userRelic.isFavorite ? "star-filled" : "star"}
                      size={24}
                      color={userRelic.isFavorite ? "#FFD700" : "#808080"}
                    />
                  </TouchableOpacity>
                </ThemedView>

                {relic.description ? (
                  <ThemedView style={styles.descriptionContainer}>
                    <ThemedText type="defaultSemiBold">Description:</ThemedText>
                    <ThemedText style={styles.description}>{relic.description}</ThemedText>
                  </ThemedView>
                ) : null}

                {userRelic.mainStats && Object.keys(userRelic.mainStats).length > 0 ? (
                  <Collapsible title="Main Stats">
                    <ThemedView style={styles.collapsibleContent}>
                      {Object.entries(userRelic.mainStats).map(([stat, value]) => (
                        <ThemedText key={stat}>• {stat}: {value}</ThemedText>
                      ))}
                    </ThemedView>
                  </Collapsible>
                ) : null}

                {userRelic.subStats && Object.keys(userRelic.subStats).length > 0 ? (
                  <Collapsible title="Sub Stats">
                    <ThemedView style={styles.collapsibleContent}>
                      {Object.entries(userRelic.subStats).map(([stat, value]) => (
                        <ThemedText key={stat}>• {stat}: {value}</ThemedText>
                      ))}
                    </ThemedView>
                  </Collapsible>
                ) : null}

                {relic.tags && relic.tags.length > 0 ? (
                  <ThemedView style={styles.tagsContainer}>
                    <ThemedText type="defaultSemiBold">Tags:</ThemedText>
                    <ThemedView style={styles.tags}>
                      {relic.tags.map((tag) => (
                        <ThemedView key={tag.id} style={styles.tag}>
                          <ThemedText style={styles.tagText}>{tag.name}</ThemedText>
                        </ThemedView>
                      ))}
                    </ThemedView>
                  </ThemedView>
                ) : null}

                <ThemedView style={styles.detailRow}>
                  <ThemedText type="defaultSemiBold">Date Added:</ThemedText>
                  <ThemedText>{new Date(userRelic.dateAdded).toLocaleDateString()}</ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Remove from Collection Button */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveRelic(userRelic._id)}
                disabled={removingRelic}
              >
                <ThemedText style={styles.buttonText}>
                  {removingRelic ? 'Removing...' : 'Remove from Collection'}
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    );
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
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  relicName: {
    fontSize: 18,
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  basicInfo: {
    flexDirection: 'column',
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarity: {
    color: '#FFD700',
  },
  level: {
    fontSize: 14,
  },
  dateAdded: {
    fontSize: 12,
    color: '#808080',
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
  // Pagination styles
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  paginationButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  paginationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  paginationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationLabel: {
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  relicImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelUpButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  levelUpButtonText: {
    color: 'white',
    fontSize: 12,
  },
  descriptionContainer: {
    marginVertical: 8,
  },
  description: {
    marginTop: 4,
    lineHeight: 20,
  },
  collapsibleContent: {
    paddingVertical: 8,
    gap: 8,
  },
  tagsContainer: {
    marginVertical: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
  },
  // Button styles
  removeButton: {
    marginTop: 16, 
    backgroundColor: '#FF6347',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});