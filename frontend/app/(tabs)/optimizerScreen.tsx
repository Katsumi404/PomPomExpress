import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Button, ActivityIndicator, View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/contexts/ConfigContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StatPicker } from '@/components/ui/StatPicker';
import { RelicDetailView } from '@/components/relics/RelicDetailView';

// Define interfaces for user and authentication
interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Define interfaces for relic data structures
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

interface OptimizationResult {
  score: number;
  relics: UserRelic[];
  statTotals: Stats;
  setBonuses: {[key: string]: number};
}

export default function RelicOptimizerScreen(): JSX.Element {
  const { user, loading } = useAuth() as AuthContextType;
  const { apiUrl } = useConfig();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  // Relics state
  const [userRelics, setUserRelics] = useState<UserRelic[]>([]);
  const [isLoadingRelics, setIsLoadingRelics] = useState<boolean>(true);
  const [relicError, setRelicError] = useState<string | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  
  // Optimization criteria
  const [optimizationCriteria, setOptimizationCriteria] = useState({
    primaryStat: 'ATK',
    secondaryStat: 'CRIT',
    setBonus: true,
    minRarity: 3
  });

  // Stats options
  const statsOptions = [
    'ATK',
    'DEF',
    'HP',
    'CRIT',
    'CRIT DMG',
    'Energy Recharge',
    'Elemental Mastery',
    'Physical DMG',
    'Elemental DMG'
  ];

  // Rarity options
  const rarityOptions = ['3★ and above', '4★ and above', '5★ only'];
  
  // Map rarity display to values
  const rarityValues = {
    '3★ and above': 3,
    '4★ and above': 4,
    '5★ only': 5
  };

  const fetchUserRelics = useCallback(async (): Promise<void> => {
    if (!user || !user.id) {
      setRelicError("User not authenticated. Please log in.");
      setIsLoadingRelics(false);
      return;
    }

    try {
      setIsLoadingRelics(true);
      // Fetch user's relics collection
      const response = await axios.get<UserRelic[]>(`${apiUrl}/users/getUserRelics/${user.id}`, {
        timeout: 5000,
      });

      // For each user relic, fetch the complete relic details and merge them
      const relicsWithDetails = await Promise.all(
        response.data.map(async (userRelic) => {
          try {
            const detailsResponse = await axios.get(
              `${apiUrl}/db/getRelics/${userRelic.relicId}`,
              { timeout: 3000 }
            );

            // Merge user relic data with full relic details
            return {
              ...userRelic,
              name: detailsResponse.data.name || "Unknown Relic",
              setName: detailsResponse.data.setName,
              description: detailsResponse.data.description,
              imageUrl: detailsResponse.data.imageUrl,
              pieceType: detailsResponse.data.pieceType,
              // Ensure we keep user-specific properties
              rarity: detailsResponse.data.rarity || userRelic.rarity,
            };
          } catch (error) {
            console.warn(`Failed to fetch details for relic ${userRelic.relicId}:`, error);
            // Return original userRelic if we can't get details
            return userRelic;
          }
        })
      );

      setUserRelics(relicsWithDetails);
      setIsLoadingRelics(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setRelicError('Failed to fetch your relics. Please try again later.');
      setIsLoadingRelics(false);
    }
  }, [apiUrl, user]);

  useEffect(() => {
    if (user && user.id) {
      fetchUserRelics();
    }
  }, [fetchUserRelics, user]);

  // Calculate a score for each relic based on optimization criteria
  const calculateRelicScore = (relic: UserRelic): number => {
    const { primaryStat, secondaryStat } = optimizationCriteria;
    let score = 0;
    
    // Add main stat score
    if (relic.mainStats[primaryStat]) {
      score += relic.mainStats[primaryStat] * 2;
    }
    
    // Add sub stat score
    if (relic.subStats[primaryStat]) {
      score += relic.subStats[primaryStat] * 2;
    }
    
    if (relic.subStats[secondaryStat]) {
      score += relic.subStats[secondaryStat] * 1.5;
    }
    
    // Factor in rarity
    score *= (relic.rarity / 3);
    
    // Factor in level
    score *= (1 + relic.level / 20);
    console.log("Scoring relic:", relic.name, "Substats:", relic.subStats, "Weights:", optimizationCriteria, "Score:", score);
    
    return score;
  };

  // Run optimization algorithm
  const optimizeRelics = (): void => {
    if (userRelics.length === 0) {
      Alert.alert('No Relics', 'You need to have relics in your collection to optimize.');
      return;
    }

    setIsOptimizing(true);
    
    // Filter relics by minimum rarity
    const eligibleRelics = userRelics.filter(
      relic => relic.rarity >= optimizationCriteria.minRarity
    );
    
    if (eligibleRelics.length === 0) {
      setIsOptimizing(false);
      Alert.alert('No Eligible Relics', `You don't have any relics with ${optimizationCriteria.minRarity}★ or higher.`);
      return;
    }
    
    // Sort relics by score
    const scoredRelics = eligibleRelics.map(relic => ({
      relic,
      score: calculateRelicScore(relic)
    })).sort((a, b) => b.score - a.score);
    
    // Pick top relics (max 4)
    const topRelics = scoredRelics.slice(0, 4).map(item => item.relic);
    
    // Calculate total stats
    const statTotals: Stats = {};
    topRelics.forEach(relic => {
      // Add main stats
      Object.entries(relic.mainStats).forEach(([stat, value]) => {
        statTotals[stat] = (statTotals[stat] || 0) + value;
      });
      
      // Add sub stats
      Object.entries(relic.subStats).forEach(([stat, value]) => {
        statTotals[stat] = (statTotals[stat] || 0) + value;
      });
    });
    
    // Calculate set bonuses
    const setBonuses: {[key: string]: number} = {};
    topRelics.forEach(relic => {
      if (relic.setName) {
        setBonuses[relic.setName] = (setBonuses[relic.setName] || 0) + 1;
      }
    });
    
    // Calculate total score
    const totalScore = topRelics.reduce((sum, relic) => 
      sum + calculateRelicScore(relic), 0);
    
    // Create optimization result
    const result: OptimizationResult = {
      score: totalScore,
      relics: topRelics,
      statTotals,
      setBonuses
    };
    
    setOptimizationResults(result);
    setIsOptimizing(false);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={themeColors.tint} />
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={[styles.errorMessage, { color: Colors.danger }]}>
          User not found. Please log in again.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>Relic Optimizer</ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Find the optimal relics for your build
          </ThemedText>
        </ThemedView>

        {/* Optimizer Form */}
        <ThemedView style={styles.formSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Optimization Criteria
          </ThemedText>

          <ThemedView style={styles.pickerSection}>
            <ThemedText style={styles.label}>Primary Stat</ThemedText>
            <View style={styles.pickerContainer}>
              <StatPicker
                selectedStat={optimizationCriteria.primaryStat}
                onChange={(value) => setOptimizationCriteria({
                  ...optimizationCriteria,
                  primaryStat: value
                })}
                stats={statsOptions}
              />
            </View>
          </ThemedView>

          <ThemedView style={styles.pickerSection}>
            <ThemedText style={styles.label}>Secondary Stat</ThemedText>
            <View style={styles.pickerContainer}>
              <StatPicker
                selectedStat={optimizationCriteria.secondaryStat}
                onChange={(value) => setOptimizationCriteria({
                  ...optimizationCriteria,
                  secondaryStat: value
                })}
                stats={statsOptions}
              />
            </View>
          </ThemedView>

          <ThemedView style={styles.pickerSection}>
            <ThemedText style={styles.label}>Minimum Rarity</ThemedText>
            <View style={styles.pickerContainer}>
              <StatPicker
                selectedStat={rarityOptions.find(option => rarityValues[option] === optimizationCriteria.minRarity) || rarityOptions[0]}
                onChange={(value) => setOptimizationCriteria({
                  ...optimizationCriteria,
                  minRarity: rarityValues[value]
                })}
                stats={rarityOptions}
              />
            </View>
          </ThemedView>

          <ThemedView style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setOptimizationCriteria({
                ...optimizationCriteria,
                setBonus: !optimizationCriteria.setBonus
              })}
            >
              <ThemedView style={[
                styles.checkboxInner,
                optimizationCriteria.setBonus && { backgroundColor: Colors.primary }
              ]}>
                {optimizationCriteria.setBonus && (
                  <IconSymbol name="check" size={14} color="#fff" />
                )}
              </ThemedView>
            </TouchableOpacity>
            <ThemedText style={styles.checkboxLabel}>
              Prioritize Set Bonuses
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <Button
              title={isOptimizing ? "Optimizing..." : "Optimize Relics"}
              onPress={optimizeRelics}
              color={Colors.primary}
              disabled={isOptimizing || isLoadingRelics}
            />
          </ThemedView>
        </ThemedView>

        {/* Loading & Error States */}
        {isLoadingRelics && !optimizationResults ? (
          <ThemedView style={styles.centerContent}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <ThemedText style={styles.loadingText}>Loading your relics...</ThemedText>
          </ThemedView>
        ) : relicError ? (
          <ThemedView style={styles.centerContent}>
            <ThemedText style={styles.errorText}>{relicError}</ThemedText>
            <Button 
              title="Retry" 
              onPress={fetchUserRelics} 
              color={Colors.primary}
            />
          </ThemedView>
        ) : null}

        {/* Recommendations */}
        {optimizationResults && (
          <ThemedView style={styles.resultsSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Optimized Loadout
            </ThemedText>
            
            <ThemedView style={styles.scoreContainer}>
              <ThemedText style={styles.scoreLabel}>Total Score</ThemedText>
              <ThemedText style={styles.scoreValue}>
                {Math.round(optimizationResults.score)}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.statsContainer}>
              <ThemedText style={styles.statsTitle}>Combined Stats</ThemedText>
              <ThemedView style={styles.statsGrid}>
                {Object.entries(optimizationResults.statTotals)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([stat, value]) => (
                    <ThemedView key={stat} style={styles.statItem}>
                      <ThemedText style={styles.statName}>{stat}</ThemedText>
                      <ThemedText style={styles.statValue}>
                        +{value.toFixed(1)}
                      </ThemedText>
                    </ThemedView>
                  ))}
              </ThemedView>
            </ThemedView>

            {Object.keys(optimizationResults.setBonuses).length > 0 && (
              <ThemedView style={styles.setBonusContainer}>
                <ThemedText style={styles.statsTitle}>Set Bonuses</ThemedText>
                {Object.entries(optimizationResults.setBonuses).map(([setName, count]) => (
                  <ThemedText key={setName} style={styles.setBonusItem}>
                    {setName} ({count} {count === 1 ? 'piece' : 'pieces'})
                  </ThemedText>
                ))}
              </ThemedView>
            )}

            <ThemedText style={styles.recommendedTitle}>Recommended Relics</ThemedText>
            <ThemedView style={styles.relicsContainer}>
              {optimizationResults.relics.map((relic) => (
                <RelicDetailView
                  key={relic._id}
                  relic={relic}
                />
              ))}
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#808080',
  },
  formSection: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  pickerSection: {
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxInner: {
    width: 16,
    height: 16,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 8,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    height: 160,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    color: Colors.danger,
    marginBottom: 12,
    textAlign: 'center',
  },
  resultsSection: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    width: '50%',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statName: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  setBonusContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  setBonusItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  recommendedTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  relicsContainer: {
    gap: 12,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
});