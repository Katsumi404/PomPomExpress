import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { UserLightCone } from './LightConeComponents';

interface LightConeDetails {
  name: string;
  path?: string;
  rarity: number;
  description?: string;
  imageUrl?: string;
  stats?: { [key: string]: number };
}

interface LightConeDetailsModalProps {
  lightCone: LightConeDetails | null;
  userLightCone: UserLightCone | null;
  visible: boolean;
  onClose: () => void;
  onUpdateLightCone: (id: string, updates: Partial<UserLightCone>) => Promise<void>;
  onRemoveLightCone: (lightConeId: string) => Promise<void>;
  onToggleFavorite?: (id: string, currentStatus: boolean) => void;
}

const LightConeDetailsModal: React.FC<LightConeDetailsModalProps> = ({
  lightCone,
  userLightCone,
  visible,
  onClose,
  onUpdateLightCone,
  onRemoveLightCone,
  onToggleFavorite,
}) => {
  const scheme = useColorScheme();
  const theme = Colors[scheme || 'light'];

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [updatedLevel, setUpdatedLevel] = useState<number>(userLightCone?.level || 1);
  const [updatedSuperimposition, setUpdatedSuperimposition] = useState<number>(userLightCone?.superimposition || 1);
  const [isFavorite, setIsFavorite] = useState<boolean>(userLightCone?.isFavorite || false);

  // Reset state when the modal is opened
  useEffect(() => {
    if (visible && userLightCone) {
      setUpdatedLevel(userLightCone.level);
      setUpdatedSuperimposition(userLightCone.superimposition || 1);
      setIsFavorite(userLightCone.isFavorite);
    }
  }, [visible, userLightCone]);

  if (!lightCone || !userLightCone) {
    return null;
  }

  const handleToggleFavorite = (e: any) => {
    e.stopPropagation();
    if (userLightCone && userLightCone._id) {
      // Update local state immediately for UI feedback
      setIsFavorite(!isFavorite);

      // Call the provided callback if it exists
      if (onToggleFavorite) {
        onToggleFavorite(userLightCone._id, isFavorite);
      } else {
        // Alternatively, use the onUpdateLightCone function
        onUpdateLightCone(userLightCone._id, {
          isFavorite: !isFavorite
        }).catch(error => {
          // Revert state if update fails
          console.error('Failed to toggle favorite:', error);
          setIsFavorite(isFavorite);
        });
      }
    }
  };

  const handleLevelChange = (increment: boolean) => {
    setUpdatedLevel(prev => {
      if (increment) {
        return prev < 80 ? prev + 1 : prev; // Max level is 80
      } else {
        return prev > 1 ? prev - 1 : prev; // Min level is 1
      }
    });
  };

  const handleSuperimpositionChange = (increment: boolean) => {
    setUpdatedSuperimposition(prev => {
      if (increment) {
        return prev < 5 ? prev + 1 : prev; // Max superimposition is 5
      } else {
        return prev > 1 ? prev - 1 : prev; // Min superimposition is 1
      }
    });
  };

  const saveChanges = async () => {
    if (userLightCone && userLightCone._id) {
      setIsUpdating(true);
      try {
        await onUpdateLightCone(userLightCone._id, {
          level: updatedLevel,
          superimposition: updatedSuperimposition,
          isFavorite: isFavorite
        });
        onClose();
      } catch (error) {
        console.error('Failed to update light cone:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const removeLightCone = async () => {
    if (userLightCone && userLightCone._id) {
      setIsRemoving(true);
      try {
        await onRemoveLightCone(userLightCone._id);
        onClose();
      } catch (error) {
        console.error('Failed to remove light cone:', error);
      } finally {
        setIsRemoving(false);
      }
    }
  };

  const getRarityStars = (rarity: number): string => '⭐'.repeat(rarity);

  // Get color for path display
  const getPathColor = (path?: string): string => {
    if (!path) return theme.text;
    
    const pathColors: { [key: string]: string } = {
      Destruction: '#e74c3c', // Red
      Harmony: '#2ecc71',     // Green
      Nihility: '#9b59b6',    // Purple
      Preservation: '#f39c12', // Orange
      Hunt: '#3498db',        // Blue
      Erudition: '#1abc9c',   // Teal
      Abundance: '#f1c40f'    // Yellow
    };
    
    return pathColors[path] || theme.text;
  };

  // Get icon for path display
  const getPathIcon = (path?: string): string => {
    if (!path) return 'circle';
    
    const pathIcons: { [key: string]: string } = {
      Destruction: 'flame',
      Harmony: 'music.note',
      Nihility: 'snowflake',
      Preservation: 'shield',
      Hunt: 'arrow.up.right',
      Erudition: 'lightbulb',
      Abundance: 'heart'
    };
    
    return pathIcons[path] || 'circle';
  };

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
              Light Cone Details
            </ThemedText>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              disabled={isUpdating || isRemoving}
              style={styles.favoriteButton}
            >
              <IconSymbol
                name={isFavorite ? 'star.fill' : 'star'}
                size={24}
                color={isFavorite ? theme.tint : theme.icon}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.lightConeHeaderSection}>
              {/* Only include the image container if there's an image URL */}
              {lightCone.imageUrl && (
                <View style={[styles.imageContainer, { backgroundColor: theme.border }]}>
                  <Image
                    source={{ uri: lightCone.imageUrl }}
                    style={styles.lightConeImage}
                  />
                </View>
              )}

              <View style={[styles.lightConeHeaderInfo, !lightCone.imageUrl && styles.lightConeHeaderInfoFull]}>
                <ThemedText type="title" style={{ color: theme.text }}>{lightCone.name}</ThemedText>
                <ThemedText style={styles.rarityText}>{getRarityStars(lightCone.rarity)}</ThemedText>

                {lightCone.path && (
                  <View style={styles.infoRow}>
                    <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>Path: </ThemedText>
                    <View style={styles.pathContainer}>
                      <IconSymbol
                        name={getPathIcon(lightCone.path)}
                        size={16}
                        color={getPathColor(lightCone.path)}
                        style={styles.pathIcon}
                      />
                      <ThemedText style={{ color: getPathColor(lightCone.path) }}>
                        {lightCone.path}
                      </ThemedText>
                    </View>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>Added: </ThemedText>
                  <ThemedText style={{ color: theme.secondaryText }}>
                    {userLightCone.dateAdded
                      ? new Date(userLightCone.dateAdded).toLocaleDateString()
                      : 'Unknown'}
                  </ThemedText>
                </View>
              </View>
            </View>

            {lightCone.description && (
              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { borderBottomColor: theme.border, color: theme.text }]}>
                  Description
                </ThemedText>
                <ThemedText style={[styles.descriptionText, { color: theme.text }]}>
                  {lightCone.description}
                </ThemedText>
              </View>
            )}

            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { borderBottomColor: theme.border, color: theme.text }]}>
                Your Light Cone Stats
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
                      style={[styles.controlButton, { backgroundColor: theme.tint }, updatedLevel >= 80 && { backgroundColor: theme.border }]}
                      onPress={() => handleLevelChange(true)}
                      disabled={updatedLevel >= 80}
                    >
                      <ThemedText style={[styles.controlButtonText, updatedLevel >= 80 && { color: theme.secondaryText }]}>+</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <ThemedText style={{ color: theme.text }}>Superimposition:</ThemedText>
                  <View style={styles.statControls}>
                    <TouchableOpacity
                      style={[styles.controlButton, { backgroundColor: theme.tint }, updatedSuperimposition <= 1 && { backgroundColor: theme.border }]}
                      onPress={() => handleSuperimpositionChange(false)}
                      disabled={updatedSuperimposition <= 1}
                    >
                      <ThemedText style={[styles.controlButtonText, updatedSuperimposition <= 1 && { color: theme.secondaryText }]}>-</ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={[styles.statValue, { color: theme.text }]}>{updatedSuperimposition}</ThemedText>
                    <TouchableOpacity
                      style={[styles.controlButton, { backgroundColor: theme.tint }, updatedSuperimposition >= 5 && { backgroundColor: theme.border }]}
                      onPress={() => handleSuperimpositionChange(true)}
                      disabled={updatedSuperimposition >= 5}
                    >
                      <ThemedText style={[styles.controlButtonText, updatedSuperimposition >= 5 && { color: theme.secondaryText }]}>+</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {lightCone.stats && Object.keys(lightCone.stats).length > 0 && (
              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { borderBottomColor: theme.border, color: theme.text }]}>
                  Base Stats
                </ThemedText>
                {Object.entries(lightCone.stats).map(([key, value]) => (
                  <View key={key} style={styles.statItem}>
                    <ThemedText style={{ color: theme.text }}>{key}:</ThemedText>
                    <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>{value}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {/* Superimposition Effects Section - Add if you have this data */}
            {/* This would be similar to constellation effects for characters */}
            {/* I'm leaving this commented as a template in case you want to add it later */}
            {/*
            {lightCone.superimpositionEffects && lightCone.superimpositionEffects.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { borderBottomColor: theme.border, color: theme.text }]}>
                  Superimposition Effects
                </ThemedText>
                {lightCone.superimpositionEffects.map((effect, index) => (
                  <View
                    key={index}
                    style={[
                      styles.superimpositionItem,
                      index <= updatedSuperimposition - 1
                        ? [styles.activeSuperimposition, { backgroundColor: `${theme.tint}20` }]
                        : [styles.inactiveSuperimposition, { backgroundColor: `${theme.secondaryText}10` }]
                    ]}
                  >
                    <ThemedText type="defaultSemiBold" style={{ color: theme.text }}>S{index + 1}:</ThemedText>
                    <ThemedText style={{ color: theme.text }}>{effect}</ThemedText>
                  </View>
                ))}
              </View>
            )}
            */}
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
              onPress={removeLightCone}
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
  scrollContent: {
    padding: 16,
    maxHeight: '70%',
  },
  lightConeHeaderSection: {
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
  lightConeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lightConeHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  lightConeHeaderInfoFull: {
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
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathIcon: {
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
  superimpositionItem: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  activeSuperimposition: {
    opacity: 0.9,
  },
  inactiveSuperimposition: {
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
    padding: 4,
    backgroundColor: '#7f8c8d',
  },
  favoriteButton: {
    padding: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LightConeDetailsModal;