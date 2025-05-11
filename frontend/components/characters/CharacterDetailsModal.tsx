import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { UserCharacter } from './CharacterComponents';
import { getElementColor, getElementDisplay } from '@/constants/ElementColors';

interface CharacterDetails {
  name: string;
  rarity: number;
  element?: string;
  weaponType?: string;
  description?: string;
  imageUrl?: string;
  stats?: { [key: string]: number };
  talents?: {
    normal: string;
    skill: string;
    burst: string;
    passive?: string[];
  };
  constellation?: string[];
}

interface CharacterDetailsModalProps {
  character: CharacterDetails | null;
  userCharacter: UserCharacter | null;
  visible: boolean;
  onClose: () => void;
  onUpdateCharacter: (id: string, updates: Partial<UserCharacter>) => Promise<void>;
  onRemoveCharacter: (characterId: string) => Promise<void>;
  onToggleFavorite?: (id: string, currentStatus: boolean) => void; // Add this line
}

const CharacterDetailsModal: React.FC<CharacterDetailsModalProps> = ({
  character,
  userCharacter,
  visible,
  onClose,
  onUpdateCharacter,
  onRemoveCharacter,
  onToggleFavorite,
}) => {
  const scheme = useColorScheme();
  const theme = Colors[scheme || 'light'];

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [updatedLevel, setUpdatedLevel] = useState<number>(userCharacter?.level || 1);
  const [updatedEidolon, setUpdatedEidolon] = useState<number>(userCharacter?.eidolon || 0);
  const [isFavourite, setIsFavourite] = useState<boolean>(userCharacter?.isFavorite || false);

  // Reset state when the modal is opened
  useEffect(() => {
    if (visible && userCharacter) {
      setUpdatedLevel(userCharacter.level);
      setUpdatedEidolon(userCharacter.eidolon || 0);
      setIsFavourite(userCharacter.isFavorite);
    }
  }, [visible, userCharacter]);

  if (!character || !userCharacter) {
    return null;
  }

  const handleToggleFavourite = (e: any) => {
    e.stopPropagation();
    if (userCharacter && userCharacter._id) {
      // Update local state immediately for UI feedback
      setIsFavourite(!isFavourite);

      // Call the provided callback if it exists
      if (onToggleFavorite) {
        onToggleFavorite(userCharacter._id, isFavourite);
      } else {
        // Alternatively, use the onUpdateCharacter function
        onUpdateCharacter(userCharacter._id, {
          isFavorite: !isFavourite
        }).catch(error => {
          // Revert state if update fails
          console.error('Failed to toggle favorite:', error);
          setIsFavourite(isFavourite);
        });
      }
    }
  };

  const handleLevelChange = (increment: boolean) => {
    setUpdatedLevel(prev => {
      if (increment) {
        return prev < 90 ? prev + 1 : prev; // Max level is 90
      } else {
        return prev > 1 ? prev - 1 : prev; // Min level is 1
      }
    });
  };

  const handleEidolonChange = (increment: boolean) => {
    setUpdatedEidolon(prev => {
      if (increment) {
        return prev < 6 ? prev + 1 : prev; // Max eidolon is 6
      } else {
        return prev > 0 ? prev - 1 : prev; // Min eidolon is 0
      }
    });
  };

  const saveChanges = async () => {
    if (userCharacter && userCharacter._id) {
      setIsUpdating(true);
      try {
        await onUpdateCharacter(userCharacter._id, {
          level: updatedLevel,
          eidolon: updatedEidolon,
          isFavorite: isFavourite // Include favorite status in updates
        });
        onClose();
      } catch (error) {
        console.error('Failed to update character:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const removeCharacter = async () => {
    if (userCharacter && userCharacter._id) {
      setIsRemoving(true);
      try {
        await onRemoveCharacter(userCharacter._id);
        onClose();
      } catch (error) {
        console.error('Failed to remove character:', error);
      } finally {
        setIsRemoving(false);
      }
    }
  };

  // Helper function to get element icon based on element name
  const getElementIcon = (element?: string): string => {
    if (!element) return 'circle';
    return getElementDisplay(element).icon;
  };

  const getRarityStars = (rarity: number): string => '⭐'.repeat(rarity);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.modalContent, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <ThemedText type="title" style={[styles.modalTitle, { color: theme.text }]}>
              Character Details
            </ThemedText>
            <TouchableOpacity
              onPress={handleToggleFavourite}
              disabled={isUpdating || isRemoving}
              style={styles.favouriteButton}
            >
              <IconSymbol
                name={isFavourite ? 'star.fill' : 'star'}
                size={24}
                color={isFavourite ? theme.tint : theme.icon}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.characterHeaderSection}>
              {/* Only include the image container if there's an image URL */}
              {character.imageUrl && (
                <View style={[styles.imageContainer, { backgroundColor: theme.border }]}>
                  <Image
                    source={{ uri: character.imageUrl }}
                    style={styles.characterImage}
                  />
                </View>
              )}

              <View style={[styles.characterHeaderInfo, !character.imageUrl && styles.characterHeaderInfoFull]}>
                <ThemedText type="title" style={{ color: theme.text }}>{character.name}</ThemedText>
                <ThemedText style={styles.rarityText}>{getRarityStars(character.rarity)}</ThemedText>

                {character.element && (
                  <View style={styles.infoRow}>
                    <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>Element: </ThemedText>
                    <View style={styles.elementContainer}>
                      <IconSymbol
                        name={getElementIcon(character.element)}
                        size={16}
                        color={getElementColor(character.element, theme.text)}
                        style={styles.elementIcon}
                      />
                      <ThemedText style={{ color: getElementColor(character.element, theme.text) }}>
                        {character.element}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {character.weaponType && (
                  <View style={styles.infoRow}>
                    <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>Weapon: </ThemedText>
                    <ThemedText style={{ color: theme.text }}>{character.weaponType}</ThemedText>
                  </View>
                )}
              </View>
            </View>

            {character.description && (
              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { borderBottomColor: theme.border, color: theme.text }]}>
                  Description
                </ThemedText>
                <ThemedText style={[styles.descriptionText, { color: theme.text }]}>
                  {character.description}
                </ThemedText>
              </View>
            )}

            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { borderBottomColor: theme.border, color: theme.text }]}>
                Your Character Stats
              </ThemedText>

              <View style={[styles.statEditor, { backgroundColor: theme.border }]}>
                <View style={styles.statRow}>
                  <ThemedText style={{ color: theme.text }}>Level:</ThemedText>
                  <View style={styles.statControls}>
                    <TouchableOpacity
                      style={[styles.controlButton, { backgroundColor: theme.tint }, updatedLevel <= 1 && { backgroundColor: theme.border }]}
                      onPress={() => handleLevelChange(false)}
                      disabled={updatedLevel <= 1}
                    >
                      <ThemedText style={[styles.controlButtonText, updatedLevel <= 1 && { color: theme.secondaryText }]}>-</ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={[styles.statValue, { color: theme.text }]}>{updatedLevel}</ThemedText>
                    <TouchableOpacity
                      style={[styles.controlButton, { backgroundColor: theme.tint }, updatedLevel >= 90 && { backgroundColor: theme.border }]}
                      onPress={() => handleLevelChange(true)}
                      disabled={updatedLevel >= 90}
                    >
                      <ThemedText style={[styles.controlButtonText, updatedLevel >= 90 && { color: theme.secondaryText }]}>+</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <ThemedText style={{ color: theme.text }}>Eidolon:</ThemedText>
                  <View style={styles.statControls}>
                    <TouchableOpacity
                      style={[styles.controlButton, { backgroundColor: theme.tint }, updatedEidolon <= 0 && { backgroundColor: theme.border }]}
                      onPress={() => handleEidolonChange(false)}
                      disabled={updatedEidolon <= 0}
                    >
                      <ThemedText style={[styles.controlButtonText, updatedEidolon <= 0 && { color: theme.secondaryText }]}>-</ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={[styles.statValue, { color: theme.text }]}>{updatedEidolon}</ThemedText>
                    <TouchableOpacity
                      style={[styles.controlButton, { backgroundColor: theme.tint }, updatedEidolon >= 6 && { backgroundColor: theme.border }]}
                      onPress={() => handleEidolonChange(true)}
                      disabled={updatedEidolon >= 6}
                    >
                      <ThemedText style={[styles.controlButtonText, updatedEidolon >= 6 && { color: theme.secondaryText }]}>+</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {character.talents && (
              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { borderBottomColor: theme.border, color: theme.text }]}>
                  Talents
                </ThemedText>

                <View style={styles.talentItem}>
                  <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>Normal Attack:</ThemedText>
                  <ThemedText style={{ color: theme.text }}>{character.talents.normal}</ThemedText>
                </View>

                <View style={styles.talentItem}>
                  <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>Elemental Skill:</ThemedText>
                  <ThemedText style={{ color: theme.text }}>{character.talents.skill}</ThemedText>
                </View>

                <View style={styles.talentItem}>
                  <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>Elemental Burst:</ThemedText>
                  <ThemedText style={{ color: theme.text }}>{character.talents.burst}</ThemedText>
                </View>

                {character.talents.passive && character.talents.passive.length > 0 && (
                  <View style={styles.talentItem}>
                    <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>Passive Talents:</ThemedText>
                    {character.talents.passive.map((passive, index) => (
                      <ThemedText key={index} style={[styles.passiveText, { color: theme.text }]}>• {passive}</ThemedText>
                    ))}
                  </View>
                )}
              </View>
            )}

            {character.constellation && character.constellation.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { borderBottomColor: theme.border, color: theme.text }]}>
                  Eidolons
                </ThemedText>
                {character.constellation.map((cons, index) => (
                  <View
                    key={index}
                    style={[
                      styles.constellationItem,
                      index <= updatedEidolon - 1
                        ? [styles.activeConstellation, { backgroundColor: `${theme.tint}20` }]
                        : [styles.inactiveConstellation, { backgroundColor: `${theme.secondaryText}10` }]
                    ]}
                  >
                    <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>E{index + 1}:</ThemedText>
                    <ThemedText style={{ color: theme.text }}>{cons}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {character.stats && Object.keys(character.stats).length > 0 && (
              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { borderBottomColor: theme.border, color: theme.text }]}>
                  Base Stats
                </ThemedText>
                {Object.entries(character.stats).map(([key, value]) => (
                  <View key={key} style={styles.statItem}>
                    <ThemedText style={{ color: theme.text }}>{key}:</ThemedText>
                    <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>{value}</ThemedText>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={saveChanges}
              disabled={isUpdating || isRemoving}
              style={[styles.button, styles.editButton, (isUpdating || isRemoving) && { opacity: 0.5 }]}
            >
              {isUpdating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>Save Changes</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={removeCharacter}
              disabled={isUpdating || isRemoving}
              style={[styles.button, styles.removeButton, (isUpdating || isRemoving) && { opacity: 0.5 }]}
            >
              {isRemoving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>Remove</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              disabled={isUpdating || isRemoving}
              style={[styles.button, styles.closeButton, (isUpdating || isRemoving) && { opacity: 0.5 }]}
            >
              <ThemedText style={styles.buttonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    maxHeight: '70%',
  },
  characterHeaderSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  characterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  characterHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  characterHeaderInfoFull: {
    width: '100%',
  },
  rarityText: {
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  elementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elementIcon: {
    marginRight: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  descriptionText: {
    lineHeight: 20,
  },
  statEditor: {
    padding: 10,
    borderRadius: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statValue: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  talentItem: {
    marginBottom: 12,
  },
  passiveText: {
    marginLeft: 10,
    marginTop: 4,
  },
  constellationItem: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  activeConstellation: {
    opacity: 0.9,
  },
  inactiveConstellation: {
    opacity: 0.5,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
  },
  buttonsContainer: {
    padding: 16,
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
  },
  closeButton: {
    backgroundColor: '#7f8c8d',
  },
  favouriteButton: {
    padding: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CharacterDetailsModal;