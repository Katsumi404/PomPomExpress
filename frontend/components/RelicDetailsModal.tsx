import React from 'react';
import { StyleSheet, Platform, View, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Props interface (moved here)
interface RelicDetailsModalProps {
  relic: RelicDetails | null;
  userRelic: UserRelic | null;
  visible: boolean;
  onClose: () => void;
  onUpdateRelic: (id: string, updates: Partial<UserRelic>) => void;
  onRemoveRelic: (id: string) => void;
}

// Interface for RelicDetails and UserRelic (you might want to keep these in a separate types file eventually)
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
  tags?: Array<{ id: string; name: string }>;
  releaseDate?: string;
  imageUrl?: string;
  schemaVersion?: string;
  updatedAt?: string | null;
}

const RelicDetailsModal = ({
  relic,
  userRelic,
  visible,
  onClose,
  onUpdateRelic,
  onRemoveRelic,
}: RelicDetailsModalProps): JSX.Element | null => {
  if (!relic || !userRelic) return null;

  const displayRelic = {
    ...relic,
    ...userRelic, // User-specific properties override the base relic properties
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ThemedView style={modalStyles.modalOverlay}>
        <ThemedView style={modalStyles.modalContent}>
          <ScrollView>
            <ThemedText type="title" style={modalStyles.modalTitle}>
              {displayRelic.name}
            </ThemedText>

            {displayRelic.imageUrl ? (
              <View style={modalStyles.imageContainer}>
                <Image
                  source={{ uri: displayRelic.imageUrl }}
                  style={modalStyles.relicImage}
                  resizeMode="contain"
                />
              </View>
            ) : null}

            <ThemedView style={modalStyles.detailsContainer}>
              {displayRelic.setName && (
                <ThemedView style={modalStyles.detailRow}>
                  <ThemedText type="defaultSemiBold">Set:</ThemedText>
                  <ThemedText>{displayRelic.setName}</ThemedText>
                </ThemedView>
              )}

              <ThemedView style={modalStyles.detailRow}>
                <ThemedText type="defaultSemiBold">Rarity:</ThemedText>
                <ThemedText>{"★".repeat(displayRelic.rarity)}</ThemedText>
              </ThemedView>

              <ThemedView style={modalStyles.detailRow}>
                <ThemedText type="defaultSemiBold">Level:</ThemedText>
                <ThemedView style={modalStyles.levelContainer}>
                  <ThemedText>{userRelic.level}/15</ThemedText>
                  <TouchableOpacity
                    style={modalStyles.levelUpButton}
                    onPress={() => onUpdateRelic(userRelic._id, { level: Math.min(userRelic.level + 1, 15) })}
                    disabled={userRelic.level >= 15}
                  >
                    <ThemedText style={modalStyles.levelUpButtonText}>Level Up</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>

              <ThemedView style={modalStyles.detailRow}>
                <ThemedText type="defaultSemiBold">Favorite:</ThemedText>
                <TouchableOpacity
                  onPress={() => onUpdateRelic(userRelic._id, { isFavorite: !userRelic.isFavorite })}
                  disabled={false}
                >
                  <IconSymbol
                    name={userRelic.isFavorite ? "star-filled" : "star"}
                    size={24}
                    color={userRelic.isFavorite ? "#FFD700" : "#808080"}
                  />
                </TouchableOpacity>
              </ThemedView>

              {displayRelic.description ? (
                <ThemedView style={modalStyles.descriptionContainer}>
                  <ThemedText type="defaultSemiBold">Description:</ThemedText>
                  <ThemedText style={modalStyles.description}>{displayRelic.description}</ThemedText>
                </ThemedView>
              ) : null}

              {userRelic.mainStats && Object.keys(userRelic.mainStats).length > 0 ? (
                <Collapsible title="Main Stats">
                  <ThemedView style={modalStyles.collapsibleContent}>
                    {Object.entries(userRelic.mainStats).map(([stat, value]) => (
                      <ThemedText key={stat}>• {stat}: {value}</ThemedText>
                    ))}
                  </ThemedView>
                </Collapsible>
              ) : null}

              {userRelic.subStats && Object.keys(userRelic.subStats).length > 0 ? (
                <Collapsible title="Sub Stats">
                  <ThemedView style={modalStyles.collapsibleContent}>
                    {Object.entries(userRelic.subStats).map(([stat, value]) => (
                      <ThemedText key={stat}>• {stat}: {value}</ThemedText>
                    ))}
                  </ThemedView>
                </Collapsible>
              ) : null}

              {relic.tags && relic.tags.length > 0 ? (
                <ThemedView style={modalStyles.tagsContainer}>
                  <ThemedText type="defaultSemiBold">Tags:</ThemedText>
                  <ThemedView style={modalStyles.tags}>
                    {relic.tags.map((tag) => (
                      <ThemedView key={tag.id} style={modalStyles.tag}>
                        <ThemedText style={modalStyles.tagText}>{tag.name}</ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                </ThemedView>
              ) : null}

              <ThemedView style={modalStyles.detailRow}>
                <ThemedText type="defaultSemiBold">Date Added:</ThemedText>
                <ThemedText>{new Date(userRelic.dateAdded).toLocaleDateString()}</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Remove from Collection Button */}
            <TouchableOpacity
              style={modalStyles.removeButton}
              onPress={() => onRemoveRelic(userRelic._id)}
              disabled={false}
            >
              <ThemedText style={modalStyles.buttonText}>
                Remove from Collection
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <ThemedText style={modalStyles.closeButtonText}>Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
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

export default RelicDetailsModal;