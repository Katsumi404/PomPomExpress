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

// Interfaces
interface User { id?: string; firstName: string; lastName: string; email: string; }
interface AuthContextType { user: User | null; loading: boolean; }
interface Stats { [key: string]: number; }
interface UserRelic { _id: string; relicId: string; name: string; rarity: number; mainStats: Stats; subStats: Stats; level: number; isFavorite: boolean; dateAdded: string; setName?: string; description?: string; imageUrl?: string; pieceType?: string; }
interface OptimizationResult { score: number; relics: UserRelic[]; statTotals: Stats; setBonuses: { [key: string]: number }; }

export default function RelicOptimizerScreen(): JSX.Element {
  const { user, loading } = useAuth() as AuthContextType;
  const { apiUrl } = useConfig();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  // State
  const [userRelics, setUserRelics] = useState<UserRelic[]>([]);
  const [isLoadingRelics, setIsLoadingRelics] = useState<boolean>(true);
  const [relicError, setRelicError] = useState<string | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // Criteria
  const [optimizationCriteria, setOptimizationCriteria] = useState({ primaryStat: 'ATK', secondaryStat: 'CRIT', setBonus: true, minRarity: 3 });

  // Options
  const statsOptions = ['ATK','DEF','HP','CRIT','CRIT DMG','Energy Recharge','Elemental Mastery','Physical DMG','Elemental DMG'];
  const rarityOptions = ['3★ and above','4★ and above','5★ only'];
  const rarityValues: Record<string, number> = { '3★ and above': 3, '4★ and above': 4, '5★ only': 5 };

  // Stat key mapping
  const statKeyMap: Record<string, string[]> = {
    ATK: ['Attack','Attack%'], DEF: ['Defense','Defense%'], HP: ['HP','HP%'],
    CRIT: ['Crit Rate'], 'CRIT DMG': ['Crit Damage'], 'Energy Recharge': ['Energy Recharge'],
    'Elemental Mastery': ['Elemental Mastery'], 'Physical DMG': ['Physical Damage'], 'Elemental DMG': ['Elemental Damage%'],
  };
  const sumStat = (stats: Stats, keys: string[]) => keys.reduce((sum, k) => sum + (stats[k] || 0), 0);

  // Fetch relics
  const fetchUserRelics = useCallback(async () => {
    if (!user?.id) { setRelicError('User not authenticated. Please log in.'); setIsLoadingRelics(false); return; }
    try {
      setIsLoadingRelics(true);
      const res = await axios.get<UserRelic[]>(`${apiUrl}/users/getUserRelics/${user.id}`, { timeout: 5000 });
      const withDetails = await Promise.all(res.data.map(async ur => {
        try {
          const detail = await axios.get(`${apiUrl}/db/getRelics/${ur.relicId}`, { timeout: 3000 });
          return { ...ur, name: detail.data.name||ur.name, setName: detail.data.setName, description: detail.data.description, imageUrl: detail.data.imageUrl, pieceType: detail.data.pieceType, rarity: detail.data.rarity||ur.rarity };
        } catch { return ur; }
      }));
      setUserRelics(withDetails);
    } catch (e) {
      console.error(e); setRelicError('Failed to fetch your relics. Please try again later.');
    } finally { setIsLoadingRelics(false); }
  }, [apiUrl, user]);

  useEffect(() => { if (user?.id) fetchUserRelics(); }, [fetchUserRelics, user]);

  // Scoring
  const calculateRelicScore = (relic: UserRelic): number => {
    const { primaryStat, secondaryStat, setBonus } = optimizationCriteria;
    const pKeys = statKeyMap[primaryStat]||[primaryStat];
    const sKeys = statKeyMap[secondaryStat]||[secondaryStat];
    const score = (
      sumStat(relic.mainStats,pKeys)*2 + sumStat(relic.subStats,pKeys)*2 + sumStat(relic.subStats,sKeys)*1.5
    ) * (relic.rarity/3) * (1 + relic.level/20)
      + (setBonus && relic.setName ? 5 : 0);
    return score;
  };

  // Optimize
  const optimizeRelics = () => {
    if (!userRelics.length) { Alert.alert('No Relics','You need relics to optimize.'); return; }
    setIsOptimizing(true);
    const eligible = userRelics.filter(r => r.rarity >= optimizationCriteria.minRarity);
    if (!eligible.length) { setIsOptimizing(false); Alert.alert('No Eligible Relics',`No relics ≥ ${optimizationCriteria.minRarity}★.`); return; }
    const scored = eligible.map(r=>({r,score:calculateRelicScore(r)})).sort((a,b)=>b.score-a.score);
    const top = scored.slice(0,4).map(x=>x.r);
    const totals: Stats={}, bonuses: Record<string,number>={};
    top.forEach(r=>{ Object.entries(r.mainStats).forEach(([k,v])=>totals[k]=(totals[k]||0)+v); Object.entries(r.subStats).forEach(([k,v])=>totals[k]=(totals[k]||0)+v); if(r.setName) bonuses[r.setName]=(bonuses[r.setName]||0)+1; });
    const totalScore = top.reduce((s,r)=>s+calculateRelicScore(r),0);
    setOptimizationResults({score:totalScore,relics:top,statTotals:totals,setBonuses:bonuses});
    setIsOptimizing(false);
  };

  // Render
  if (loading) return <ThemedView style={styles.container}><ActivityIndicator size="large" color={themeColors.tint} /></ThemedView>;
  if (!user) return <ThemedView style={styles.container}><ThemedText style={[styles.errorMessage,{color:Colors.danger}]}>User not found. Please log in again.</ThemedText></ThemedView>;

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>Relic Optimizer</ThemedText>
          <ThemedText type="default" style={styles.subtitle}>Find the optimal relics for your build</ThemedText>
        </ThemedView>

        <ThemedView style={styles.formSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Optimization Criteria</ThemedText>

          <ThemedView style={styles.pickerSection}>
            <ThemedText style={styles.label}>Primary Stat</ThemedText>
            <View style={styles.pickerContainer}>
              <StatPicker selectedStat={optimizationCriteria.primaryStat} onChange={s=>setOptimizationCriteria({...optimizationCriteria,primaryStat:s})} stats={statsOptions} />
            </View>
          </ThemedView>

          <ThemedView style={styles.pickerSection}>
            <ThemedText style={styles.label}>Secondary Stat</ThemedText>
            <View style={styles.pickerContainer}>
              <StatPicker selectedStat={optimizationCriteria.secondaryStat} onChange={s=>setOptimizationCriteria({...optimizationCriteria,secondaryStat:s})} stats={statsOptions} />
            </View>
          </ThemedView>

          <ThemedView style={styles.pickerSection}>
            <ThemedText style={styles.label}>Minimum Rarity</ThemedText>
            <View style={styles.pickerContainer}>
              <StatPicker selectedStat={rarityOptions.find(o=>rarityValues[o]===optimizationCriteria.minRarity)||rarityOptions[0]} onChange={s=>setOptimizationCriteria({...optimizationCriteria,minRarity:rarityValues[s]})} stats={rarityOptions} />
            </View>
          </ThemedView>

          <ThemedView style={styles.checkboxContainer}>
            <TouchableOpacity style={styles.checkbox} onPress={()=>setOptimizationCriteria({...optimizationCriteria,setBonus:!optimizationCriteria.setBonus})}>
              <ThemedView style={[styles.checkboxInner,optimizationCriteria.setBonus&&{backgroundColor:Colors.primary}]}> {optimizationCriteria.setBonus&&<IconSymbol name="check" size={14} color="#fff" />} </ThemedView>
            </TouchableOpacity>
            <ThemedText style={styles.checkboxLabel}>Prioritize Set Bonuses</ThemedText>
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <Button title={isOptimizing?"Optimizing...":"Optimize Relics"} onPress={optimizeRelics} color={Colors.primary} disabled={isOptimizing||isLoadingRelics} />
          </ThemedView>
        </ThemedView>

        {isLoadingRelics&&!optimizationResults? (
          <ThemedView style={styles.centerContent}><ActivityIndicator size="large" color={Colors.primary} /><ThemedText style={styles.loadingText}>Loading your relics...</ThemedText></ThemedView>
        ) : relicError? (
          <ThemedView style={styles.centerContent}><ThemedText style={styles.errorText}>{relicError}</ThemedText><Button title="Retry" onPress={fetchUserRelics} color={Colors.primary} /></ThemedView>
        ) : null}

        {optimizationResults&&(
          <ThemedView style={styles.resultsSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Optimized Loadout</ThemedText>

            <ThemedView style={styles.scoreContainer}>
              <ThemedText style={styles.scoreLabel}>Total Score</ThemedText>
              <ThemedText style={styles.scoreValue}>{Math.round(optimizationResults.score)}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.statsContainer}>
              <ThemedText style={styles.statsTitle}>Combined Stats</ThemedText>
              <ThemedView style={styles.statsGrid}>
                {Object.entries(optimizationResults.statTotals).sort(([a],[b])=>a.localeCompare(b)).map(([stat,val])=>(
                  <ThemedView key={stat} style={styles.statItem}><ThemedText style={styles.statName}>{stat}</ThemedText><ThemedText style={styles.statValue}>+{val.toFixed(1)}</ThemedText></ThemedView>
                ))}
              </ThemedView>
            </ThemedView>

            {Object.keys(optimizationResults.setBonuses).length>0&&(
              <ThemedView style={styles.setBonusContainer}><ThemedText style={styles.statsTitle}>Set Bonuses</ThemedText>{Object.entries(optimizationResults.setBonuses).map(([set,count])=><ThemedText key={set} style={styles.setBonusItem}>{set} ({count} {count===1?'piece':'pieces'})</ThemedText>)}</ThemedView>
            )}

            <ThemedText style={styles.recommendedTitle}>Recommended Relics</ThemedText>
            <ThemedView style={styles.relicsContainer}>{optimizationResults.relics.map(relic=><RelicDetailView key={relic._id} relic={relic} />)}</ThemedView>
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