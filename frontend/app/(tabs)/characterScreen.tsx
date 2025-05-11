import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, View, Modal, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import axios from 'axios';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/contexts/ConfigContext';
import { PaginationControls } from '@/components/characters/CharacterComponents';
import { getElementColor, getElementDisplay } from '@/constants/ElementColors';

// Character Types
export interface Character {
  _id: string;
  name: string;
  element?: string;
  path?: string;
  rarity: number;
  voiceActor?: string;
  description?: string;
  imageUrl?: string;
  abilities?: string[];
  baseStats?: { [key: string]: number | string };
  tags?: string[];
  releaseDate?: string;
}

// Character Card component for this screen
const BrowserCard: React.FC<{
  character: Character;
  onPress: () => void;
}> = ({ character, onPress }) => {
  const elementDisplay = character.element ? getElementDisplay(character.element) : null;

  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.characterName}>
          {character.name}
        </ThemedText>
        <ThemedView style={styles.basicInfo}>
          {character.element && (
            <View style={styles.elementContainer}>
              {elementDisplay && (
                <IconSymbol
                  name={elementDisplay.icon || 'circle'}
                  size={16}
                  color={getElementColor(character.element, '#FFFFFF')}
                  style={styles.elementIcon}
                />
              )}
              <ThemedText 
                style={[
                  styles.element, 
                  { color: character.element ? getElementColor(character.element, undefined) : undefined }
                ]}
              >
                {character.element}
              </ThemedText>
              <ThemedText style={styles.element}> • {character.path}</ThemedText>
            </View>
          )}
          <ThemedText style={styles.rarity}>
            {"★".repeat(character.rarity)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

// Character Details Modal Component
const CharacterDetailsModal: React.FC<{
  character: Character | null;
  visible: boolean;
  onClose: () => void;
  onAddToCollection: () => void;
  addingToCollection: boolean;
}> = ({ character, visible, onClose, onAddToCollection, addingToCollection }) => {
  if (!character) return null;
  
  const elementDisplay = character.element ? getElementDisplay(character.element) : null;
  
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
              {character.name}
            </ThemedText>
            
            {character.imageUrl ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: character.imageUrl }} 
                  style={styles.characterImage} 
                  resizeMode="contain"
                />
              </View>
            ) : null}
            
            <ThemedView style={styles.detailsContainer}>
              {character.element && (
                <ThemedView style={styles.detailRow}>
                  <ThemedText type="defaultSemiBold">Element:</ThemedText>
                  <View style={styles.elementDetailContainer}>
                    {elementDisplay && (
                      <IconSymbol
                        name={elementDisplay.icon || 'circle'}
                        size={16}
                        color={getElementColor(character.element, '#FFFFFF')}
                        style={styles.elementIcon}
                      />
                    )}
                    <ThemedText style={{ color: getElementColor(character.element, undefined) }}>
                      {character.element}
                    </ThemedText>
                  </View>
                </ThemedView>
              )}
              
              <ThemedView style={styles.detailRow}>
                <ThemedText type="defaultSemiBold">Path:</ThemedText>
                <ThemedText>{character.path}</ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.detailRow}>
                <ThemedText type="defaultSemiBold">Rarity:</ThemedText>
                <ThemedText style={styles.rarity}>{"★".repeat(character.rarity)}</ThemedText>
              </ThemedView>
              
              {character.voiceActor ? (
                <ThemedView style={styles.detailRow}>
                  <ThemedText type="defaultSemiBold">Voice Actor:</ThemedText>
                  <ThemedText>{character.voiceActor}</ThemedText>
                </ThemedView>
              ) : null}
              
              {character.description ? (
                <ThemedView style={styles.descriptionContainer}>
                  <ThemedText type="defaultSemiBold">Description:</ThemedText>
                  <ThemedText style={styles.description}>{character.description}</ThemedText>
                </ThemedView>
              ) : null}
              
              {character.abilities && character.abilities.length > 0 ? (
                <Collapsible title="Abilities">
                  <ThemedView style={styles.collapsibleContent}>
                    {character.abilities.map((ability, index) => (
                      <ThemedText key={index}>• {ability}</ThemedText>
                    ))}
                  </ThemedView>
                </Collapsible>
              ) : null}
              
              {character.baseStats && Object.keys(character.baseStats).length > 0 ? (
                <Collapsible title="Base Stats">
                  <ThemedView style={styles.collapsibleContent}>
                    {Object.entries(character.baseStats).map(([stat, value]) => (
                      <ThemedText key={stat}>• {stat}: {value}</ThemedText>
                    ))}
                  </ThemedView>
                </Collapsible>
              ) : null}
              
              {character.tags && character.tags.length > 0 ? (
                <ThemedView style={styles.tagsContainer}>
                  <ThemedText type="defaultSemiBold">Tags:</ThemedText>
                  <ThemedView style={styles.tags}>
                    {character.tags.map((tag, index) => (
                      <ThemedView key={index} style={styles.tag}>
                        <ThemedText style={styles.tagText}>{tag}</ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                </ThemedView>
              ) : null}
              
              {character.releaseDate ? (
                <ThemedView style={styles.detailRow}>
                  <ThemedText type="defaultSemiBold">Release Date:</ThemedText>
                  <ThemedText>{new Date(character.releaseDate).toLocaleDateString()}</ThemedText>
                </ThemedView>
              ) : null}
            </ThemedView>
            
            {/* Add to Collection Button */}
            <TouchableOpacity 
              style={styles.addToCollectionButton}
              onPress={onAddToCollection}
              disabled={addingToCollection}
            >
              <ThemedText style={styles.buttonText}>
                {addingToCollection ? 'Adding...' : 'Add to My Collection'}
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

export default function CharactersScreen() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  
  const { user } = useAuth();
  const { apiUrl } = useConfig();

  // PAGINATION: State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiUrl}/db/getCharacters`, {
        timeout: 5000,
      });
      setCharacters(response.data);
      setCurrentPage(1); // Reset to first page
      setIsLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to fetch characters. Please try again later.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacterDetails = async (id: string) => {
    try {
      const response = await axios.get(`${apiUrl}/db/getCharacters/${id}`, {
        timeout: 5000,
      });
      setSelectedCharacter(response.data);
      setModalVisible(true);
    } catch (error) {
      console.error('Fetch character details error:', error);
      setError('Failed to fetch character details. Please try again later.');
    }
  };
  
  const addToUserCollection = async () => {
    if (!user || !user.id) {
      Alert.alert('Authentication Required', 'Please log in to add characters to your collection.');
      return;
    }
    
    if (!selectedCharacter) return;
    
    try {
      setAddingToCollection(true);
      
      const response = await axios.post(`${apiUrl}/users/addCharacterToCollection`, {
        userId: user.id,
        characterId: selectedCharacter._id
      }, {
        timeout: 5000
      });
      
      Alert.alert('Success', `${selectedCharacter.name} has been added to your collection!`);
      setAddingToCollection(false);
    } catch (error) {
      console.error('Add to collection error:', error);
      
      // Check for specific error responses
      if (error.response && error.response.status === 409) {
        Alert.alert('Already in Collection', `${selectedCharacter.name} is already in your collection.`);
      } else {
        Alert.alert('Error', 'Failed to add character to your collection. Please try again later.');
      }
      
      setAddingToCollection(false);
    }
  };

  // PAGINATION: Logic
  const totalPages = Math.ceil(characters.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCharacters = characters.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="star.fill"
          style={styles.headerImage}
        />
      }
    >
      {isLoading ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText>Loading characters...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.container}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Honkai Star Rail Characters</ThemedText>
          </ThemedView>

          {currentCharacters.map((character) => (
            <BrowserCard 
              key={character._id} 
              character={character} 
              onPress={() => fetchCharacterDetails(character._id)} 
            />
          ))}

          {/* Use PaginationControls from CharacterComponents */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </ThemedView>
      )}

      <CharacterDetailsModal 
        character={selectedCharacter}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddToCollection={addToUserCollection}
        addingToCollection={addingToCollection}
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
  characterName: {
    fontSize: 18,
    marginBottom: 4,
  },
  basicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  elementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elementDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  element: {
    fontSize: 14,
  },
  elementIcon: {
    marginRight: 4,
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
  characterImage: {
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
  }
});