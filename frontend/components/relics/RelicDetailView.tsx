import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

// Define the allowed stats for relics
const STAT_TYPES = [
  'HP', 'Attack', 'Defense', 'Speed', 'Crit Rate', 'Crit Damage', 
  'Effect Hit Rate', 'Effect RES', 'Break Effect', 'Attack%', 
  'Defense%', 'Speed%', 'HP%', 'Crit Rate%', 'Crit Damage%'
];

// Stat formatting helper
const formatStatValue = (value, statName) => {
  const isPercentageStat = statName.includes('%');
  if (isPercentageStat) {
    return `+${value.toFixed(3)}%`;
  }
  return `+${value.toFixed(3)}`;
};

// Stats display component
const StatDisplay = ({ statName, value }) => (
  <ThemedView style={styles.statItem}>
    <ThemedText style={styles.statName}>{statName}</ThemedText>
    <ThemedText style={styles.statValue}>
      {formatStatValue(value, statName)}
    </ThemedText>
  </ThemedView>
);

// Define interface for stats
interface Stats {
  [key: string]: number;
}

// Define interface for UserRelic
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

// Props for RelicDetailView
interface RelicDetailViewProps {
  relic: UserRelic;
}

export const RelicDetailView = ({ relic }: RelicDetailViewProps): JSX.Element => {
  // Check if relic has valid stats objects
  const hasMainStats = relic.mainStats && Object.keys(relic.mainStats).length > 0;
  const hasSubStats = relic.subStats && Object.keys(relic.subStats).length > 0;

  // Log stats for debugging
  React.useEffect(() => {
    console.log('Relic main stats:', relic.mainStats);
    console.log('Relic sub stats:', relic.subStats);
  }, [relic]);

  return (
    <ThemedView style={styles.container}>
      {/* Header with relic name and favorite status */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.relicName}>{relic.name}</ThemedText>
        <View style={styles.favoriteIconContainer}>
          <IconSymbol
            name={relic.isFavorite ? 'star-filled' : 'star'}
            size={16}
            color={relic.isFavorite ? '#FFD700' : '#808080'}
          />
        </View>
      </ThemedView>

      {/* Relic details section */}
      <ThemedView style={styles.detailsSection}>
        <ThemedView style={styles.row}>
          <ThemedView style={styles.infoCol}>
            {/* Basic info */}
            <ThemedView style={styles.basicInfoRow}>
              <ThemedText style={styles.label}>Rarity:</ThemedText>
              <ThemedText style={styles.rarityStars}>
                {"★".repeat(relic.rarity)}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.basicInfoRow}>
              <ThemedText style={styles.label}>Level:</ThemedText>
              <ThemedText style={styles.value}>{relic.level}</ThemedText>
            </ThemedView>

            {relic.pieceType && (
              <ThemedView style={styles.basicInfoRow}>
                <ThemedText style={styles.label}>Type:</ThemedText>
                <ThemedText style={styles.value}>{relic.pieceType}</ThemedText>
              </ThemedView>
            )}

            {relic.setName && (
              <ThemedView style={styles.basicInfoRow}>
                <ThemedText style={styles.label}>Set:</ThemedText>
                <ThemedText style={styles.setName}>{relic.setName}</ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          {/* Image if available */}
          {relic.imageUrl && (
            <ThemedView style={styles.imageContainer}>
              <Image 
                source={{ uri: relic.imageUrl }} 
                style={styles.relicImage}
                resizeMode="contain"
              />
            </ThemedView>
          )}
        </ThemedView>

        {/* Stats section */}
        <ThemedView style={styles.statsSection}>
          {/* Main stats */}
          {hasMainStats && (
            <ThemedView style={styles.statsBlock}>
              <ThemedText style={styles.statsTitle}>Main Stats</ThemedText>
              <ThemedView style={styles.statsGrid}>
                {Object.entries(relic.mainStats).map(([stat, value]) => (
                  <StatDisplay key={stat} statName={stat} value={value} />
                ))}
              </ThemedView>
            </ThemedView>
          )}

          {/* Sub stats */}
          {hasSubStats && (
            <ThemedView style={styles.statsBlock}>
              <ThemedText style={styles.statsTitle}>Sub Stats</ThemedText>
              <ThemedView style={styles.statsGrid}>
                {Object.entries(relic.subStats).map(([stat, value]) => (
                  <StatDisplay key={stat} statName={stat} value={value} />
                ))}
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>

        {/* Description if available */}
        {relic.description && (
          <ThemedView style={styles.descriptionContainer}>
            <ThemedText style={styles.descriptionText} numberOfLines={2}>
              {relic.description}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  relicName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  favoriteIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsSection: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  basicInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#555',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
  },
  rarityStars: {
    fontSize: 13,
    color: '#FFD700',
  },
  setName: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 8,
  },
  relicImage: {
    width: '100%',
    height: '100%',
  },
  statsSection: {
    marginTop: 4,
  },
  statsBlock: {
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 4,
  },
  statItem: {
    width: '50%',
    paddingVertical: 2,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statName: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  descriptionContainer: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  descriptionText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});