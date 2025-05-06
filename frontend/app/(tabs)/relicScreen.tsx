import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, View, Modal, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import axios from 'axios';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

// Define interfaces for our data structures
interface Relic {
  _id: string;
  name: string;
  setType: string;
  rarity: number;
  description?: string;
  bonuses?: string[];
  imageUrl?: string;
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
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface AddRelicToCollectionRequest {
  userId: string;
  relicId: string;
}

interface AddRelicToCollectionResponse {
  success: boolean;
  message?: string;
}

export default function RelicsScreen(): JSX.Element {
  const [relics, setRelics] = useState<Relic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const { user } = useAuth();

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 5;

  const fetchRelics = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.get<Relic[]>('http://10.202.134.121:3000/db/getRelics', {
        timeout: 5000,
      });
      setRelics(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      setCurrentPage(1);
      setIsLoading(false);
    } catch (error) {
      console.error('Fetch relics error:', error);
      setError('Failed to fetch relics. Please try again later.');
      setIsLoading(false);
    }
  };

  const fetchRelicDetails = async (id: string): Promise<void> => {
    try {
      const response = await axios.get<Relic>(`http://10.202.134.121:3000/db/getRelics/${id}`, {
        timeout: 5000,
      });
      setSelectedRelic(response.data);
      setModalVisible(true);
    } catch (error) {
      console.error('Fetch relic details error:', error);
      setError('Failed to fetch relic details.');
    }
  };

  useEffect(() => {
    fetchRelics();
  }, []);

  const addToUserRelicCollection = async (): Promise<void> => {
    if (!user || !user.id || !selectedRelic) {
      Alert.alert('Authentication Required', 'Please log in to manage your relic collection.');
      return;
    }
  
    try {
      const payload: AddRelicToCollectionRequest = {
        userId: user.id,
        relicId: selectedRelic._id,
      };
  
      const response = await axios.post<AddRelicToCollectionResponse>(
        'http://10.202.134.121:3000/users/addRelicToCollection',
        payload,
        { timeout: 5000 }
      );
  
      if (response.data.success) {
        Alert.alert('Success', `${selectedRelic.name} added to your collection!`);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add relic.');
      }
    } catch (error) {
      console.error('Add relic error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  
    setModalVisible(false);
  };
  

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const getCurrentPageItems = (): Relic[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return relics.slice(startIndex, endIndex);
  };

  const RelicCard = ({ relic, onPress }: RelicCardProps): JSX.Element => (
    <TouchableOpacity onPress={() => onPress(relic._id)}>
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.cardTitle}>{relic.name}</ThemedText>
        <ThemedView style={styles.cardInfo}>
          <ThemedText style={styles.setType}>{relic.setType}</ThemedText>
          <ThemedText style={styles.rarity}>{"★".repeat(relic.rarity)}</ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  const RelicDetailsModal = ({ relic, visible, onClose, onAddToCollection }: RelicDetailsModalProps): JSX.Element | null => {
    if (!relic) return null;

    return (
      <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ScrollView>
              <ThemedText type="title" style={styles.modalTitle}>{relic.name}</ThemedText>

              {relic.imageUrl && (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: relic.imageUrl }} style={styles.characterImage} resizeMode="contain" />
                </View>
              )}

              <ThemedText>Set Type: {relic.setType}</ThemedText>
              <ThemedText>Rarity: {"★".repeat(relic.rarity)}</ThemedText>

              {relic.description && (
                <ThemedView style={styles.descriptionContainer}>
                  <ThemedText>Description:</ThemedText>
                  <ThemedText style={styles.description}>{relic.description}</ThemedText>
                </ThemedView>
              )}

              {relic.bonuses?.length > 0 && (
                <Collapsible title="Bonuses">
                  <ThemedView style={styles.collapsibleContent}>
                    {relic.bonuses.map((bonus, index) => (
                      <ThemedText key={index}>• {bonus}</ThemedText>
                    ))}
                  </ThemedView>
                </Collapsible>
              )}

              <TouchableOpacity
                style={styles.addToCollectionButton}
                onPress={onAddToCollection}
              >
                <ThemedText style={styles.buttonText}>Add to My Collection (Later)</ThemedText>
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

  const PaginationControls = ({ currentPage, totalPages, onPageChange }: PaginationControlsProps): JSX.Element => (
    <ThemedView style={styles.paginationContainer}>
      <TouchableOpacity
        onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
      >
        <ThemedText style={styles.paginationText}>Previous</ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.paginationLabel}>Page {currentPage} of {totalPages}</ThemedText>

      <TouchableOpacity
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
      >
        <ThemedText style={styles.paginationText}>Next</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8E8E8', dark: '#444' }}
      headerImage={<IconSymbol size={310} name="shield" color="#808080" style={styles.headerImage} />}
    >
      {isLoading ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText>Loading relics...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.titleContainer}>Honkai Star Rail Relics</ThemedText>

          {getCurrentPageItems().map(relic => (
            <RelicCard key={relic._id} relic={relic} onPress={fetchRelicDetails} />
          ))}

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </ThemedView>
      )}

      <RelicDetailsModal
        relic={selectedRelic}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddToCollection={addToUserRelicCollection}
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
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setType: {
    fontSize: 14,
    color: '#555',
  },
  rarity: {
    color: '#FFD700',
    fontSize: 14,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    height: 300,
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
  paginationText: {
    color: 'white',
    fontWeight: 'bold',
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
    backgroundColor: '#fff',
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
  characterImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
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
  // New buttons for collection functionality
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