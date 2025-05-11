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
] as const;

type StatType = typeof STAT_TYPES[number];

// Stat formatting helper
const formatStatValue = (value: number, statName: string) => {
  const isPercentageStat = statName.includes('%');
  return isPercentageStat ? `+${value.toFixed(1)}%` : `+${value.toFixed(1)}`;
};

// Validates and filters stat entries
const validStats = (stats: Stats): [string, number][] =>
  Object.entries(stats).filter(([stat]) => STAT_TYPES.includes(stat as StatType));

// Reusable row component
const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
  <ThemedView style={styles.basicInfoRow}>
    <ThemedText style={styles.label}>{label}</ThemedText>
    <ThemedText style={styles.value}>{value}</ThemedText>
  </ThemedView>
);

// Stats display component
const StatDisplay = ({ statName, value }: { statName: string; value: number }) => (
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
  const hasMainStats = relic.mainStats && Object.keys(relic.mainStats).length > 0;
  const hasSubStats = relic.subStats && Object.keys(relic.subStats).length > 0;

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
            <InfoRow label="Rarity:" value={"★".repeat(relic.rarity)} />
            <InfoRow label="Level:" value={relic.level} />
            {relic.pieceType && <InfoRow label="Type:" value={relic.pieceType} />}
            {relic.setName && <InfoRow label="Set:" value={relic.setName} />}
          </ThemedView>

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
          {hasMainStats && (
            <ThemedView style={styles.statsBlock}>
              <ThemedText style={styles.statsTitle}>Main Stats</ThemedText>
              <ThemedView style={styles.statsGrid}>
                {validStats(relic.mainStats).map(([stat, value]) => (
                  <StatDisplay key={stat} statName={stat} value={value} />
                ))}
              </ThemedView>
            </ThemedView>
          )}

          {hasSubStats && (
            <ThemedView style={styles.statsBlock}>
              <ThemedText style={styles.statsTitle}>Sub Stats</ThemedText>
              <ThemedView style={styles.statsGrid}>
                {validStats(relic.subStats).map(([stat, value]) => (
                  <StatDisplay key={stat} statName={stat} value={value} />
                ))}
              </ThemedView>
            </ThemedView>
          )}

          {!hasMainStats && !hasSubStats && (
            <ThemedText style={styles.noStatsText}>No stats available</ThemedText>
          )}
        </ThemedView>

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
  noStatsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 6,
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
