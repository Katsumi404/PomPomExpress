import React from 'react';
import {
  StyleSheet,
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

interface Stats { [key: string]: number; }

export interface UserLightCone {
  _id: string;
  lightConeId: string;
  userId: string;
  name: string;
  rarity: number;
  level: number;
  superimposition: number;
  isFavorite: boolean;
  dateAdded: string;
  path?: string;
  imageUrl?: string;
  description?: string;
  stats?: Stats;
}

export interface LightCone {
  _id: string;
  name: string;
  path: string;
  rarity: number;
  imageUrl?: string;
  description?: string;
  stats?: Stats;
}

const getRarityStars = (rarity: number): string => '⭐'.repeat(rarity);

export const LightConeCard: React.FC<{
  lightCone: UserLightCone;
  onPress: () => void;
}> = ({ lightCone, onPress }) => {
  const scheme = useColorScheme();
  const theme = Colors[scheme || 'light'];

  const handleFav = (e: any) => {
    e.stopPropagation();
    onPressFavorite(lightCone._id, lightCone.isFavorite);
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView
        style={[
          styles.card,
          { backgroundColor: theme.background },
          lightCone.isFavorite && {
            borderWidth: 2,
            borderColor: theme.tint,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.name, { color: theme.text }]}
          >
            {lightCone.name}
          </ThemedText>
          <TouchableOpacity onPress={handleFav} style={styles.favoriteButton}>
            <IconSymbol
              name={lightCone.isFavorite ? 'star.fill' : 'star'}
              size={20}
              color={lightCone.isFavorite ? theme.tint : theme.icon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: theme.border },
            ]}
          />
          <View style={styles.info}>
            <ThemedText type="default" style={{ color: theme.text }}>
              {getRarityStars(lightCone.rarity)}
            </ThemedText>

            <View style={styles.row}>
              <ThemedText type="default" style={{ color: theme.text }}>
                Level:{' '}
              </ThemedText>
              <ThemedText
                type="defaultSemiBold"
                style={{ color: theme.text }}
              >
                {lightCone.level}
              </ThemedText>
            </View>

            <View style={styles.row}>
              <ThemedText type="default" style={{ color: theme.text }}>
                Superimposition:{' '}
              </ThemedText>
              <ThemedText
                type="defaultSemiBold"
                style={{ color: theme.text }}
              >
                {lightCone.superimposition}
              </ThemedText>
            </View>

            {lightCone.path && (
              <View style={styles.row}>
                <ThemedText type="default" style={{ color: theme.text }}>
                  Path:{' '}
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: theme.text }}
                >
                  {lightCone.path}
                </ThemedText>
              </View>
            )}

            <ThemedText type="default" style={{ color: theme.secondaryText }}>
              Added:{' '}
              {lightCone.dateAdded
                ? new Date(lightCone.dateAdded).toLocaleDateString()
                : 'Unknown'}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

export const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const scheme = useColorScheme();
  const theme = Colors[scheme || 'light'];

  return (
    <ThemedView style={styles.paginationContainer}>
      <TouchableOpacity
        onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={[
          styles.pageButton,
          { backgroundColor: theme.tint },
          currentPage === 1 && { backgroundColor: theme.border },
        ]}
      >
        <ThemedText
          style={[
            styles.pageButtonText,
            currentPage === 1 && { color: theme.secondaryText },
          ]}
        >
          Prev
        </ThemedText>
      </TouchableOpacity>

      <ThemedText style={[styles.pageIndicator, { color: theme.text }]}>
        {currentPage} / {totalPages}
      </ThemedText>

      <TouchableOpacity
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={[
          styles.pageButton,
          { backgroundColor: theme.tint },
          currentPage === totalPages && { backgroundColor: theme.border },
        ]}
      >
        <ThemedText
          style={[
            styles.pageButtonText,
            currentPage === totalPages && { color: theme.secondaryText },
          ]}
        >
           Next 
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    flex: 1,
  },
  favoriteButton: {
    marginLeft: 8,
  },
  cardContent: {
    flexDirection: 'row',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 4,
    overflow: 'hidden',
  },
  info: {
    flex: 1,
    justifyContent: 'space-around',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 5,
  },
  pageButton: {
    padding: 6,
    borderRadius: 4,
  },
  pageButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  pageIndicator: {
    fontWeight: '600',
  },
});