import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  useColorScheme
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Collapsible } from '@/components/Collapsible';
import { Colors } from '@/constants/Colors';
import RelicEditForm from './RelicEditForm';

// Define interfaces
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
  pieceType?: string; 
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

interface RelicDetailsModalProps {
  relic: RelicDetails | null;
  userRelic: UserRelic | null;
  visible: boolean;
  onClose: () => void;
  onUpdateRelic: (id: string, updates: Partial<UserRelic>) => Promise<void>;
  onRemoveRelic: (id: string) => Promise<void>;
}

const RelicDetailsModal: React.FC<RelicDetailsModalProps> = ({
  relic,
  userRelic,
  visible,
  onClose,
  onUpdateRelic,
  onRemoveRelic,
}) => {
  if (!relic || !userRelic) return null;

  const scheme = useColorScheme();
  const theme = Colors[scheme || 'light'];
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [localRelicData, setLocalRelicData] = useState<UserRelic>(userRelic);

  useEffect(() => {
    // When the modal becomes visible, reset the local state to the current userRelic
    if (visible && userRelic) {
      setLocalRelicData(userRelic);
      setIsEditing(false); // Start in view mode
    }
  }, [visible, userRelic]);

  const handleSave = (formData: Partial<UserRelic>) => {
    // Prepare the updates, excluding _id
    const { _id, ...updates } = formData as any;
    onUpdateRelic(userRelic._id, updates);
    setIsEditing(false); // Switch back to view mode after saving
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalRelicData(userRelic); // Reset local data
  };

  // Combine relic and userRelic data for display
  const displayRelic = {
    ...relic,
    ...localRelicData,
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.modalOverlay}>
        <ThemedView 
          style={[
            styles.modalContent, 
            { backgroundColor: theme.background }
          ]}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedText 
              style={[styles.modalTitle, { color: theme.text }]}
              type="title"
            >
              {displayRelic.name}
            </ThemedText>
            
            {isEditing ? (
              <RelicEditForm
                relic={relic}
                userRelic={userRelic}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <ThemedView>
                {/* Static Display */}
                {displayRelic.imageUrl && (
                  <ThemedView style={styles.imageContainer}>
                    <Image 
                      source={{ uri: displayRelic.imageUrl }} 
                      style={styles.relicImage}
                      resizeMode="contain"
                    />
                  </ThemedView>
                )}
                
                <ThemedView style={styles.detailsContainer}>
                  {displayRelic.setName && (
                    <ThemedView style={styles.detailRow}>
                      <ThemedText style={[styles.label, { color: theme.text }]}>Set:</ThemedText>
                      <ThemedText style={{ color: theme.tint }}>{displayRelic.setName}</ThemedText>
                    </ThemedView>
                  )}
                  
                  <ThemedView style={styles.detailRow}>
                    <ThemedText style={[styles.label, { color: theme.text }]}>Rarity:</ThemedText>
                    <ThemedText style={[styles.rarityStars, { color: theme.tint }]}>
                      {"★".repeat(displayRelic.rarity)}
                    </ThemedText>
                  </ThemedView>
                  
                  <ThemedView style={styles.detailRow}>
                    <ThemedText style={[styles.label, { color: theme.text }]}>Level:</ThemedText>
                    <ThemedText style={{ color: theme.text }}>{userRelic.level}/15</ThemedText>
                  </ThemedView>
                  
                  <ThemedView style={styles.detailRow}>
                    <ThemedText style={[styles.label, { color: theme.text }]}>Favorite:</ThemedText>
                    <IconSymbol 
                      name={userRelic.isFavorite ? "star.fill" : "star"} 
                      size={24} 
                      color={userRelic.isFavorite ? theme.tint : theme.icon} 
                    />
                  </ThemedView>

                  <ThemedView style={styles.detailRow}>
                    <ThemedText style={[styles.label, { color: theme.text }]}>Piece Type:</ThemedText>
                    <ThemedText style={{ color: theme.text }}>{userRelic.pieceType || 'Head'}</ThemedText>
                  </ThemedView>
                  
                  {displayRelic.description && (
                    <ThemedView style={styles.descriptionContainer}>
                      <ThemedText style={[styles.label, { color: theme.text }]}>Description:</ThemedText>
                      <ThemedText style={[styles.descriptionText, { color: theme.secondaryText }]}>
                        {displayRelic.description}
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
                
                {/* Main Stats */}
                {userRelic.mainStats && Object.keys(userRelic.mainStats).length > 0 && (
                  <Collapsible title="Main Stats">
                    <ThemedView style={styles.statsContainer}>
                      {Object.entries(userRelic.mainStats).map(([stat, value]) => (
                        <ThemedView key={stat} style={styles.statRow}>
                          <ThemedText style={{ color: theme.text }}>{stat}:</ThemedText>
                          <ThemedText style={{ color: theme.text }}>{value}</ThemedText>
                        </ThemedView>
                      ))}
                    </ThemedView>
                  </Collapsible>
                )}
                
                {/* Sub Stats */}
                {userRelic.subStats && Object.keys(userRelic.subStats).length > 0 && (
                  <Collapsible title="Sub Stats">
                    <ThemedView style={styles.statsContainer}>
                      {Object.entries(userRelic.subStats).map(([stat, value]) => (
                        <ThemedView key={stat} style={styles.statRow}>
                          <ThemedText style={{ color: theme.text }}>{stat}:</ThemedText>
                          <ThemedText style={{ color: theme.text }}>{value}</ThemedText>
                        </ThemedView>
                      ))}
                    </ThemedView>
                  </Collapsible>
                )}
                
                {/* Tags */}
                {relic.tags && relic.tags.length > 0 && (
                  <ThemedView style={styles.tagsContainer}>
                    <ThemedText style={[styles.label, { color: theme.text }]}>Tags:</ThemedText>
                    <ThemedView style={styles.tagsWrapper}>
                      {relic.tags.map((tag) => (
                        <ThemedView 
                          key={tag.id} 
                          style={[styles.tagPill, { backgroundColor: theme.border }]}
                        >
                          <ThemedText style={[styles.tagText, { color: theme.text }]}>
                            {tag.name}
                          </ThemedText>
                        </ThemedView>
                      ))}
                    </ThemedView>
                  </ThemedView>
                )}
                
                <ThemedView style={styles.detailRow}>
                  <ThemedText style={[styles.label, { color: theme.text }]}>Date Added:</ThemedText>
                  <ThemedText style={{ color: theme.secondaryText }}>
                    {new Date(userRelic.dateAdded).toLocaleDateString()}
                  </ThemedText>
                </ThemedView>
                
                <ThemedView style={styles.buttonsContainer}>
                  <TouchableOpacity 
                    style={[styles.button, { backgroundColor: theme.tint }]}
                    onPress={() => setIsEditing(true)}
                  >
                    <ThemedText style={styles.buttonText}>Edit</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.removeButton]}
                    onPress={() => onRemoveRelic(userRelic._id)}
                  >
                    <ThemedText style={styles.buttonText}>Remove</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, { backgroundColor: theme.border }]}
                    onPress={onClose}
                  >
                    <ThemedText style={styles.buttonText}>Close</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            )}
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  relicImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  detailsContainer: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  rarityStars: {
    fontSize: 16,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 5,
  },
  statsContainer: {
    paddingLeft: 10,
    paddingTop: 5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  tagsContainer: {
    marginVertical: 10,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tagPill: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 3,
  },
  tagText: {
    fontSize: 12,
  },
  buttonsContainer: {
    marginTop: 20,
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginVertical: 5,
  },
  removeButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RelicDetailsModal;