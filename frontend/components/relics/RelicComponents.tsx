import React from 'react';
import {
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

// Favorite handler
let onPressFavorite: (id: string, currentStatus: boolean) => void = () => {};
export const setOnPressFavorite = (
  callback: (id: string, currentStatus: boolean) => void
) => {
  onPressFavorite = callback;
};

// Data interfaces for TypeScript
export interface Stats {
  [key: string]: number;
}

export interface UserRelic {
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

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const RelicCard = ({
  relic,
  onPress,
}: {
  relic: UserRelic;
  onPress: () => void;
}): JSX.Element => {
  const scheme = useColorScheme() as 'light' | 'dark';
  const theme = Colors[scheme];

  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView
        style={[
          styles.card,
          { backgroundColor: theme.background },
          relic.isFavorite && {
            borderWidth: 2,
            borderColor: theme.tint,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <ThemedText
            type="title"
            style={[styles.relicName, { color: theme.text }]}
          >
            {relic.name ||
              `Relic ID: ${relic.relicId?.substring(0, 8) || 'Unknown'}`}
          </ThemedText>
          <TouchableOpacity
            onPress={() => onPressFavorite(relic._id, relic.isFavorite)}
            style={styles.favoriteButton}
          >
            <IconSymbol
              name={relic.isFavorite ? 'star.fill' : 'star'}
              size={20}
              color={relic.isFavorite ? theme.tint : theme.icon}
            />
          </TouchableOpacity>
        </View>

        <ThemedView style={styles.basicInfo}>
          <View style={styles.infoRow}>
            <ThemedText style={[styles.rarity, { color: theme.tint }]}>
              {relic.rarity ? '★'.repeat(relic.rarity) : '⭒'}
            </ThemedText>
            <ThemedText style={[styles.level, { color: theme.text }]}>
              Level: {relic.level || 0}
            </ThemedText>
          </View>

          {relic.setName && (
            <ThemedText style={[styles.setName, { color: theme.tint }]}>
              Set: {relic.setName}
            </ThemedText>
          )}

          {relic.mainStats && Object.keys(relic.mainStats).length > 0 && (
            <ThemedText style={[styles.statsPreview, { color: theme.secondaryText }]}>
              Main:{' '}
              {Object.entries(relic.mainStats)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')}
            </ThemedText>
          )}

          <ThemedText style={[styles.dateAdded, { color: theme.secondaryText }]}>
            Added:{' '}
            {relic.dateAdded
              ? new Date(relic.dateAdded).toLocaleDateString()
              : 'Unknown date'}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps): JSX.Element => {
  const scheme = useColorScheme() as 'light' | 'dark';
  const theme = Colors[scheme];

  return (
    <ThemedView style={styles.paginationContainer}>
      <TouchableOpacity
        onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={[
          styles.paginationButton,
          { backgroundColor: theme.tint },
          currentPage === 1 && { backgroundColor: theme.border },
        ]}
      >
        <ThemedText style={[
          styles.paginationButtonText,
          currentPage === 1 && { color: theme.secondaryText },
        ]}>
          Previous
        </ThemedText>
      </TouchableOpacity>

      <View style={styles.paginationInfo}>
        <ThemedText style={[styles.paginationLabel, { color: theme.text }]}>
          Page {currentPage} of {totalPages}
        </ThemedText>
      </View>

      <TouchableOpacity
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={[
          styles.paginationButton,
          { backgroundColor: theme.tint },
          currentPage === totalPages && { backgroundColor: theme.border },
        ]}
      >
        <ThemedText style={[
          styles.paginationButtonText,
          currentPage === totalPages && { color: theme.secondaryText },
        ]}>
          Next
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

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
    borderRadius: 12,
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
    fontSize: 16,
  },
  level: {
    fontSize: 14,
  },
  setName: {
    fontSize: 14,
    marginTop: 2,
  },
  statsPreview: {
    fontSize: 14,
    marginTop: 2,
  },
  dateAdded: {
    fontSize: 12,
    marginTop: 2,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  paginationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledButton: {},
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
