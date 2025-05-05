import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, View, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import axios from 'axios';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Define interfaces for our data structures
interface Stats {
  [key: string]: number;
}

interface LightCone {
  _id: string;
  name: string;
  path: string;
  rarity: number;
  description?: string;
  stats?: Stats;
  tags?: string[];
  releaseDate?: string;
  imageUrl?: string;
  schemaVersion?: string;
  updatedAt?: string | null;
}

// Props interfaces
interface LightConeCardProps {
  lightCone: LightCone;
}

interface LightConeDetailsModalProps {
  lightCone: LightCone | null;
  visible: boolean;
  onClose: () => void;
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function LightConesScreen(): JSX.Element {
  const [lightCones, setLightCones] = useState<LightCone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLightCone, setSelectedLightCone] = useState<LightCone | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 10; // Number of items to display per page

  const fetchLightCones = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Update the URL to match your API endpoint
      const response = await axios.get<LightCone[]>('http://10.202.134.121:3000/db/getLightCones', {
        timeout: 5000,
      });
      setLightCones(response.data);
      // Calculate total pages
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      setIsLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to fetch light cones. Please try again later.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLightCones();
  }, []);

  const fetchLightConeDetails = async (id: string): Promise<void> => {
    try {
      // Update the URL to match your API endpoint for fetching a single light cone
      const response = await axios.get<LightCone>(`http://10.202.134.121:3000/db/getLightCones/${id}`, {
        timeout: 5000,
      });
      setSelectedLightCone(response.data);
      setModalVisible(true);
    } catch (error) {
      console.error('Fetch light cone details error:', error);
      setError('Failed to fetch light cone details. Please try again later.');
    }
  };

  // Handle page change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  // Get current page items
  const getCurrentPageItems = (): LightCone[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return lightCones.slice(startIndex, endIndex);
  };

  const LightConeCard = ({ lightCone }: LightConeCardProps): JSX.Element => (
    <TouchableOpacity onPress={() => fetchLightConeDetails(lightCone._id)}>
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.lightConeName}>
          {lightCone.name}
        </ThemedText>
        <ThemedView style={styles.basicInfo}>
          <ThemedText style={styles.path}>
            Path: {lightCone.path}
          </ThemedText>
          <ThemedText style={styles.rarity}>
            {"★".repeat(lightCone.rarity)}
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
        style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
      >
        <ThemedText style={styles.paginationButtonText}>Previous</ThemedText>
      </TouchableOpacity>
      
      <ThemedView style={styles.paginationInfo}>
        <ThemedText>
          Page {currentPage} of {totalPages}
        </ThemedText>
      </ThemedView>
      
      <TouchableOpacity 
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
        disabled={currentPage === totalPages}
        style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
      >
        <ThemedText style={styles.paginationButtonText}>Next</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  const LightConeDetailsModal = ({ lightCone, visible, onClose }: LightConeDetailsModalProps): JSX.Element | null => {
    if (!lightCone) return null;
    
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
                {lightCone.name}
              </ThemedText>
              
              {lightCone.imageUrl ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: lightCone.imageUrl }} 
                    style={styles.lightConeImage} 
                    resizeMode="contain"
                  />
                </View>
              ) : null}
              
              <ThemedView style={styles.detailsContainer}>                
                <ThemedView style={styles.detailRow}>
                  <ThemedText type="defaultSemiBold">Path:</ThemedText>
                  <ThemedText>{lightCone.path}</ThemedText>
                </ThemedView>
                
                <ThemedView style={styles.detailRow}>
                  <ThemedText type="defaultSemiBold">Rarity:</ThemedText>
                  <ThemedText>{"★".repeat(lightCone.rarity)}</ThemedText>
                </ThemedView>
                
                {lightCone.description ? (
                  <ThemedView style={styles.descriptionContainer}>
                    <ThemedText type="defaultSemiBold">Description:</ThemedText>
                    <ThemedText style={styles.description}>{lightCone.description}</ThemedText>
                  </ThemedView>
                ) : null}
                
                {lightCone.stats && Object.keys(lightCone.stats).length > 0 ? (
                  <Collapsible title="Stats">
                    <ThemedView style={styles.collapsibleContent}>
                      {Object.entries(lightCone.stats).map(([stat, value]) => (
                        <ThemedText key={stat}>• {stat}: {value}</ThemedText>
                      ))}
                    </ThemedView>
                  </Collapsible>
                ) : null}
                
                {lightCone.tags && lightCone.tags.length > 0 ? (
                  <ThemedView style={styles.tagsContainer}>
                    <ThemedText type="defaultSemiBold">Tags:</ThemedText>
                    <ThemedView style={styles.tags}>
                      {lightCone.tags.map((tag, index) => (
                        <ThemedView key={index} style={styles.tag}>
                          <ThemedText style={styles.tagText}>{tag}</ThemedText>
                        </ThemedView>
                      ))}
                    </ThemedView>
                  </ThemedView>
                ) : null}
                
                {lightCone.releaseDate ? (
                  <ThemedView style={styles.detailRow}>
                    <ThemedText type="defaultSemiBold">Release Date:</ThemedText>
                    <ThemedText>{new Date(lightCone.releaseDate).toLocaleDateString()}</ThemedText>
                  </ThemedView>
                ) : null}

                {lightCone.schemaVersion ? (
                  <ThemedView style={styles.detailRow}>
                    <ThemedText type="defaultSemiBold">Schema Version:</ThemedText>
                    <ThemedText>{lightCone.schemaVersion}</ThemedText>
                  </ThemedView>
                ) : null}
              </ThemedView>
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
          name="sparkles"
          style={styles.headerImage}
        />
      }
    >
      {isLoading ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText>Loading light cones...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.container}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Honkai Star Rail Light Cones</ThemedText>
          </ThemedView>
          
          {getCurrentPageItems().map((lightCone) => (
            <LightConeCard key={lightCone._id} lightCone={lightCone} />
          ))}
          
          {/* Pagination controls */}
          <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </ThemedView>
      )}
      
      <LightConeDetailsModal 
        lightCone={selectedLightCone}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
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
  lightConeName: {
    fontSize: 18,
    marginBottom: 4,
  },
  basicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  path: {
    fontSize: 14,
  },
  rarity: {
    color: '#FFD700',
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
  paginationButtonDisabled: {
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
  lightConeImage: {
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