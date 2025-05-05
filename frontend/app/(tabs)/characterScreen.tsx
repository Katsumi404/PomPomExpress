import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, View, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import axios from 'axios';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function CharactersScreen() {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // PAGINATION: State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://10.202.134.121:3000/db/getCharacters', {
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

  const fetchCharacterDetails = async (id) => {
    try {
      const response = await axios.get(`http://10.202.134.121:3000/db/getCharacters/${id}`, {
        timeout: 5000,
      });
      setSelectedCharacter(response.data);
      setModalVisible(true);
    } catch (error) {
      console.error('Fetch character details error:', error);
      setError('Failed to fetch character details. Please try again later.');
    }
  };

  const CharacterCard = ({ character }) => (
    <TouchableOpacity onPress={() => fetchCharacterDetails(character._id)}>
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.characterName}>
          {character.name}
        </ThemedText>
        <ThemedView style={styles.basicInfo}>
          <ThemedText style={styles.element}>
            {character.element} • {character.path}
          </ThemedText>
          <ThemedText style={styles.rarity}>
            {"★".repeat(character.rarity)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  const CharacterDetailsModal = ({ character, visible, onClose }) => {
    if (!character) return null;
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
              {/* ... existing modal content unchanged ... */}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    );
  };

  // PAGINATION: Logic
  const totalPages = Math.ceil(characters.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCharacters = characters.slice(indexOfFirstItem, indexOfLastItem);

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
            <CharacterCard key={character._id} character={character} />
          ))}

          {/* PAGINATION: Buttons */}
          <ThemedView style={styles.paginationContainer}>
            <TouchableOpacity
              onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
            >
              <ThemedText style={styles.paginationText}>Previous</ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.paginationLabel}>
              Page {currentPage} of {totalPages}
            </ThemedText>

            <TouchableOpacity
              onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
            >
              <ThemedText style={styles.paginationText}>Next</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      )}

      <CharacterDetailsModal 
        character={selectedCharacter}
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
  characterName: {
    fontSize: 18,
    marginBottom: 4,
  },
  basicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  element: {
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#888',
  },
  paginationText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  paginationLabel: {
    fontWeight: 'bold',
  },
});