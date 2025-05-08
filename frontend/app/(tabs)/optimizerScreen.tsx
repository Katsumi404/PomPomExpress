import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Button } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from'@/contexts/ConfigContext';
import { RelicCard, PaginationControls } from '@/components/relics/RelicComponents'; 
import { StatPicker } from '@/components/ui/StatPicker';

interface Stats { [key: string]: number; }
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

const SLOT_NAMES = ['Head', 'Hands', 'Body', 'Feet', 'Sphere', 'Link'];

export default function OptimizerScreen(): JSX.Element {
  const { user } = useAuth();
  const { apiUrl } = useConfig();

  const [userRelics, setUserRelics] = useState<UserRelic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const allStats = ['ATK%', 'Crit Rate', 'Crit DMG', 'HP%', 'DEF%', 'Energy Recharge', 'Elemental Mastery'];
  const [statA, setStatA] = useState<string>(allStats[0]);
  const [statB, setStatB] = useState<string>(allStats[1]);

  const [optimizedSet, setOptimizedSet] = useState<Record<string, UserRelic> | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 5;

  const fetchUserRelics = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const resp = await axios.get<UserRelic[]>(`${apiUrl}/users/getUserRelics/${user.id}`, { timeout: 5000 });

      const details = await Promise.all(resp.data.map(async ur => {
        try {
          const d = await axios.get(`${apiUrl}/db/getRelics/${ur.relicId}`, { timeout: 3000 });
          return { ...ur, name: d.data.name, setName: d.data.setName, description: d.data.description, imageUrl: d.data.imageUrl, rarity: d.data.rarity || ur.rarity };
        } catch {
          return ur;
        }
      }));

      setUserRelics(details);
      setTotalPages(Math.ceil(details.length / itemsPerPage));
    } catch (e) {
      setError('Failed to load relics');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, user]);

  useEffect(() => {
    fetchUserRelics();
  }, [fetchUserRelics]);

  function getSlotFromName(name: string): string | null {
    return SLOT_NAMES.find(slot => name.includes(slot)) || null;
  }

  function optimizeRelics(relics: UserRelic[], sA: string, sB: string): Record<string, UserRelic> {
    const grouped: Record<string, UserRelic[]> = {};

    // Group relics by inferred slot
    for (const relic of relics) {
      const slot = getSlotFromName(relic.name);
      if (slot) {
        if (!grouped[slot]) grouped[slot] = [];
        grouped[slot].push(relic);
      }
    }

    const optimized: Record<string, UserRelic> = {};

    for (const slot of SLOT_NAMES) {
      const candidates = grouped[slot] || [];

      const scored = candidates.map(r => {
        const vA = (r.mainStats[sA] || 0) + (r.subStats[sA] || 0);
        const vB = (r.mainStats[sB] || 0) + (r.subStats[sB] || 0);
        return { relic: r, score: vA + vB };
      });

      const best = scored.sort((a, b) => b.score - a.score)[0]?.relic;
      if (best) {
        optimized[slot] = best;
      }
    }

    return optimized;
  }

  const runOptimizer = () => {
    const result = optimizeRelics(userRelics, statA, statB);
    setOptimizedSet(result);
  };

  const getCurrentPageItems = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return userRelics.slice(start, start + itemsPerPage);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="user-shield"
          style={styles.headerImage}
        />
      }
    >
      {isLoading ? (
        <ThemedView style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <ThemedText>Loading your relics...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.container}>
          <ThemedText type="title">Relic Optimizer</ThemedText>

          {/* Stat Pickers */}
          <View style={styles.pickersRow}>
            <StatPicker selectedStat={statA} onChange={setStatA} stats={allStats} />
            <StatPicker selectedStat={statB} onChange={setStatB} stats={allStats} />
          </View>

          <Button title="Run Optimizer" onPress={runOptimizer} />

          {/* Optimized Set Display */}
          {optimizedSet && (
            <ThemedView style={styles.resultContainer}>
              <ThemedText type="subtitle">Optimized 6‑Piece Set</ThemedText>
              {Object.entries(optimizedSet).map(([slot, relic]) => (
                <RelicCard key={slot} relic={relic} onPress={() => {}} />
              ))}
            </ThemedView>
          )}

          {/* Fallback: Paged List */}
          {!optimizedSet && getCurrentPageItems().map((r) => (
            <RelicCard key={r._id} relic={r} onPress={() => {}} />
          ))}

          {!optimizedSet && userRelics.length > itemsPerPage && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </ThemedView>
      )}
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    height: 300,
  },
  errorText: { color: 'red' },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  picker: { flex: 1, marginHorizontal: 4 },
  resultContainer: { marginTop: 24 },
});
