import React from 'react';
import { StyleSheet, Platform, View, TouchableOpacity, Image } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Define interfaces for our data structures (moved here for better organization)
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
  // Add additional fields from the full relic
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

// Props interfaces
interface RelicCardProps {
  relic: UserRelic;
  onPress: () => void;
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Helper function to be set by the parent component
let onPressFavorite: (id: string, currentStatus: boolean) => void = () => {};

export const setOnPressFavorite = (callback: (id: string, currentStatus: boolean) => void) => {
  onPressFavorite = callback;
};

export const RelicCard = ({ relic, onPress }: RelicCardProps): JSX.Element => {
  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView style={styles.card}>
        <ThemedView style={styles.cardHeader}>
          <ThemedText type="title" style={styles.relicName}>
            {relic.name || `Relic ID: ${relic.relicId?.substring(0, 8) || 'Unknown'}`}
          </ThemedText>
          <TouchableOpacity
            onPress={() => onPressFavorite(relic._id, relic.isFavorite)}
            style={styles.favoriteButton}
          >
            <IconSymbol
              name={relic.isFavorite ? 'star-filled' : 'star'}
              size={20}
              color={relic.isFavorite ? '#FFD700' : '#808080'}
            />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.basicInfo}>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.rarity}>
              {relic.rarity ? '★'.repeat(relic.rarity) : '⭒'}
            </ThemedText>
            <ThemedText style={styles.level}>
              Level: {relic.level || 0}
            </ThemedText>
          </ThemedView>

          {relic.setName && (
            <ThemedText style={styles.setName}>
              Set: {relic.setName}
            </ThemedText>
          )}

          {relic.mainStats && Object.keys(relic.mainStats).length > 0 && (
            <ThemedText style={styles.statsPreview}>
              Main: {Object.entries(relic.mainStats)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}
            </ThemedText>
          )}

          <ThemedText style={styles.dateAdded}>
            Added: {relic.dateAdded ? new Date(relic.dateAdded).toLocaleDateString() : 'Unknown date'}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

export const PaginationControls = ({ currentPage, totalPages, onPageChange }: PaginationControlsProps): JSX.Element => (
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

const styles = StyleSheet.create({
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
  setName: {
    fontSize: 14,
    color: '#4a90e2',
    marginTop: 2,
  },
  statsPreview: {
    fontSize: 14,
    marginTop: 2,
  },
  dateAdded: {
    fontSize: 12,
    color: '#808080',
    marginTop: 2,
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
});

export { RelicCard, PaginationControls, setOnPressFavorite };