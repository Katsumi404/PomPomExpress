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
import { useConfig } from'@/contexts/ConfigContext'; 

// Define interfaces for our data structures
interface Stats {
  [key: string]: number;
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

// Props interfaces
interface RelicCardProps {
  relic: Relic;
  onPress: (id: string) => void;
}

interface RelicDetailsModalProps {
  relic: Relic | null;
  visible: boolean;
  onClose: () => void;
  onAddToCollection: () => void;
  isAdding: boolean;
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function RelicsScreen(): JSX.Element {
  const [relics, setRelics] = useState<Relic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [addingToCollection, setAddingToCollection] = useState<boolean>(false);
  
  const { user } = useAuth();
  const { apiUrl } = useConfig();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 5;

  const fetchRelics = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Update the URL to match your API endpoint
      const response = await axios.get<Relic[]>(`${apiUrl}/db/getRelics`, {
        timeout: 5000,
      });
      setRelics(response.data);
      // Calculate total pages
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      setCurrentPage(1); // Reset to first page when data is loaded
      setIsLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to fetch relics. Please try again later.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRelics();
  }, []);

  const fetchRelicDetails = async (id: string): Promise<void> => {
    try {
      // Update the URL to match your API endpoint for fetching a single relic
      const response = await axios.get<Relic>(`${apiUrl}/db/getRelics/${id}`, {
        timeout: 5000,
      });
      setSelectedRelic(response.data);
      setModalVisible(true);
    } catch (error) {
      console.error('Fetch relic details error:', error);
      setError('Failed to fetch relic details. Please try again later.');
    }
  };

  // Add to user's collection
  const addToUserCollection = async (): Promise<void> => {
    if (!user || !user.id) {
      Alert.alert('Authentication Required', 'Please log in to add relics to your collection.');
      return;
    }
    
    if (!selectedRelic) return;
    
    try {
      setAddingToCollection(true);
      
      const response = await axios.post(`${apiUrl}/users/addRelicToCollection`, {
        userId: user.id,
        relicId: selectedRelic._id,
        mainStats: selectedRelic.mainStats || {},
        subStats: selectedRelic.subStats || {}
      }, {
        timeout: 5000
      });
      
      Alert.alert('Success', `${selectedRelic.name} has been added to your collection!`);
      setAddingToCollection(false);
    } catch (error) {
      console.error('Add to collection error:', error);
      
      // Check for specific error responses
      if (error.response && error.response.status === 409) {
        Alert.alert('Already in Collection', `${selectedRelic.name} is already in your collection.`);
      } else {
        Alert.alert('Error', 'Failed to add relic to your collection. Please try again later.');
      }
      
      setAddingToCollection(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  // Get current page items
  const getCurrentPageItems = (): Relic[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return relics.slice(startIndex, endIndex);
  };

  const RelicCard = ({ relic, onPress }: RelicCardProps): JSX.Element => (
    <TouchableOpacity onPress={() => onPress(relic._id)}>
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.relicName}>
          {relic.name || "Unknown Relic"}
        </ThemedText>
        
        <ThemedView style={styles.rarityContainer}>
          <ThemedText style={styles.rarity}>
            {"★".repeat(relic.rarity || 0)}
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
    visible, 
    onClose,
    onAddToCollection,
    isAdding 
  }: RelicDetailsModalProps): JSX.Element | null => {
    if (!relic) return null;
    
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
                
                {relic.description ? (
                  <ThemedView style={styles.descriptionContainer}>
                    <ThemedText type="defaultSemiBold">Description:</ThemedText>
                    <ThemedText style={styles.description}>{relic.description}</ThemedText>
                  </ThemedView>
                ) : null}
                
                {relic.mainStats && Object.keys(relic.mainStats).length > 0 ? (
                  <Collapsible title="Main Stats">
                    <ThemedView style={styles.collapsibleContent}>
                      {Object.entries(relic.mainStats).map(([stat, value]) => (
                        <ThemedText key={stat}>• {stat}: {value}</ThemedText>
                      ))}
                    </ThemedView>
                  </Collapsible>
                ) : null}
                
                {relic.subStats && Object.keys(relic.subStats).length > 0 ? (
                  <Collapsible title="Sub Stats">
                    <ThemedView style={styles.collapsibleContent}>
                      {Object.entries(relic.subStats).map(([stat, value]) => (
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
                
                {relic.releaseDate ? (
                  <ThemedView style={styles.detailRow}>
                    <ThemedText type="defaultSemiBold">Release Date:</ThemedText>
                    <ThemedText>{new Date(relic.releaseDate).toLocaleDateString()}</ThemedText>
                  </ThemedView>
                ) : null}

                {relic.schemaVersion ? (
                  <ThemedView style={styles.detailRow}>
                    <ThemedText type="defaultSemiBold">Schema Version:</ThemedText>
                    <ThemedText>{relic.schemaVersion}</ThemedText>
                  </ThemedView>
                ) : null}
              </ThemedView>

              {/* Add to Collection Button */}
              <TouchableOpacity 
                style={styles.addToCollectionButton}
                onPress={onAddToCollection}
                disabled={isAdding}
              >
                <ThemedText style={styles.buttonText}>
                  {isAdding ? 'Adding...' : 'Add to My Collection'}
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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="shield"
          style={styles.headerImage}
        />
      }
    >
      {isLoading ? (
        <ThemedView style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007BFF" />
          <ThemedText style={styles.loadingText}>Loading relics...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.container}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Honkai Star Rail Relics</ThemedText>
          </ThemedView>
          
          {getCurrentPageItems().map((relic) => (
            <RelicCard 
              key={relic._id} 
              relic={relic} 
              onPress={fetchRelicDetails}
            />
          ))}
          
          {/* Pagination controls */}
          {relics.length > itemsPerPage && (
            <PaginationControls 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </ThemedView>
      )}
      
      <RelicDetailsModal 
        relic={selectedRelic}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddToCollection={addToUserCollection}
        isAdding={addingToCollection}
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
  relicName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rarityContainer: {
    alignItems: 'flex-start',
  },
  rarity: {
    fontSize: 18,
    color: '#FFD700', // Gold color for stars
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
  addToCollectionButton: {
    marginTop: 16, 
    backgroundColor: '#4CAF50',
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