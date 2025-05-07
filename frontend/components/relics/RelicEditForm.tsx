import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  View, 
  Switch 
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Define interfaces
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
}

interface RelicDetails {
  _id: string;
  name: string;
  setName?: string;
  rarity: number;
  description?: string;
  mainStats?: Stats;
  subStats?: Stats;
  tags?: Array<{id: string, name: string}>;
  releaseDate?: string;
  imageUrl?: string;
  schemaVersion?: string;
  updatedAt?: string | null;
}

interface RelicEditFormProps {
  relic: RelicDetails | null;
  userRelic: UserRelic;
  onSave: (formData: Partial<UserRelic>) => void;
  onCancel: () => void;
}

const RelicEditForm: React.FC<RelicEditFormProps> = ({ 
  relic, 
  userRelic, 
  onSave, 
  onCancel 
}) => {
  // Initialize form data from the user relic
  const [formData, setFormData] = useState<Partial<UserRelic>>({
    name: userRelic?.name || '',
    level: userRelic?.level || 1,
    isFavorite: userRelic?.isFavorite || false,
    mainStats: { ...userRelic?.mainStats } || {},
    subStats: { ...userRelic?.subStats } || {},
  });

  // Update form data if userRelic changes
  useEffect(() => {
    if (userRelic) {
      setFormData({
        name: userRelic.name || '',
        level: userRelic.level || 1,
        isFavorite: userRelic.isFavorite || false,
        mainStats: { ...userRelic.mainStats } || {},
        subStats: { ...userRelic.subStats } || {},
      });
    }
  }, [userRelic]);

  // Handle text input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle level change with validation
  const handleLevelChange = (value: string) => {
    const level = parseInt(value, 10);
    if (!isNaN(level) && level >= 1 && level <= 15) {
      setFormData(prev => ({ ...prev, level }));
    }
  };

  // Handle stat changes
  const handleStatChange = (statType: 'mainStats' | 'subStats', statName: string, value: string) => {
    const numValue = parseFloat(value);
    setFormData(prev => ({
      ...prev,
      [statType]: {
        ...prev[statType],
        [statName]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  // Add a new stat
  const handleAddStat = (statType: 'mainStats' | 'subStats') => {
    setFormData(prev => ({
      ...prev,
      [statType]: {
        ...prev[statType],
        'New Stat': 0
      }
    }));
  };

  // Remove a stat
  const handleRemoveStat = (statType: 'mainStats' | 'subStats', statName: string) => {
    const updatedStats = { ...formData[statType as keyof typeof formData] } as Stats;
    delete updatedStats[statName];
    setFormData(prev => ({
      ...prev,
      [statType]: updatedStats
    }));
  };

  // Rename a stat (by removing the old one and adding a new one with the same value)
  const handleStatKeyChange = (statType: 'mainStats' | 'subStats', oldStatName: string, newStatName: string) => {
    const stats = formData[statType as keyof typeof formData] as Stats;
    if (!stats) return;
    
    const statValue = stats[oldStatName];
    const updatedStats = { ...stats };
    
    delete updatedStats[oldStatName];
    updatedStats[newStatName] = statValue;
    
    setFormData(prev => ({
      ...prev,
      [statType]: updatedStats
    }));
  };

  // Handle save button
  const handleSave = () => {
    onSave(formData);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
        
        <ThemedView style={styles.formRow}>
          <ThemedText style={styles.label}>Name:</ThemedText>
          <TextInput
            style={styles.textInput}
            value={formData.name as string}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="Relic name"
          />
        </ThemedView>

        <ThemedView style={styles.formRow}>
          <ThemedText style={styles.label}>Level:</ThemedText>
          <ThemedView style={styles.levelControlContainer}>
            <TouchableOpacity 
              style={[styles.levelButton, styles.decrementButton]}
              onPress={() => handleLevelChange(String(Math.max(1, (formData.level || 1) - 1)))}
            >
              <ThemedText style={styles.levelButtonText}>-</ThemedText>
            </TouchableOpacity>
            
            <TextInput
              style={styles.levelInput}
              value={String(formData.level)}
              onChangeText={handleLevelChange}
              keyboardType="numeric"
              maxLength={2}
            />
            
            <TouchableOpacity 
              style={[styles.levelButton, styles.incrementButton]}
              onPress={() => handleLevelChange(String(Math.min(15, (formData.level || 1) + 1)))}
            >
              <ThemedText style={styles.levelButtonText}>+</ThemedText>
            </TouchableOpacity>
            
            <ThemedText style={styles.maxLevelText}>/15</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.formRow}>
          <ThemedText style={styles.label}>Favorite:</ThemedText>
          <ThemedView style={styles.favoriteContainer}>
            <Switch
              value={formData.isFavorite}
              onValueChange={(value) => handleInputChange('isFavorite', value)}
            />
            <IconSymbol
              name={formData.isFavorite ? 'star-filled' : 'star'}
              size={24}
              color={formData.isFavorite ? '#FFD700' : '#808080'}
              style={styles.favoriteIcon}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Main Stats Section */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Main Stats</ThemedText>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => handleAddStat('mainStats')}
          >
            <ThemedText style={styles.addButtonText}>Add Stat</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {Object.entries(formData.mainStats || {}).map(([statName, statValue]) => (
          <ThemedView key={`main-${statName}`} style={styles.statRow}>
            <TextInput
              style={styles.statNameInput}
              value={statName}
              onChangeText={(text) => handleStatKeyChange('mainStats', statName, text)}
            />
            <TextInput
              style={styles.statValueInput}
              value={String(statValue)}
              onChangeText={(text) => handleStatChange('mainStats', statName, text)}
              keyboardType="numeric"
            />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveStat('mainStats', statName)}
            >
              <ThemedText style={styles.removeButtonText}>×</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Sub Stats Section */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Sub Stats</ThemedText>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => handleAddStat('subStats')}
          >
            <ThemedText style={styles.addButtonText}>Add Stat</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {Object.entries(formData.subStats || {}).map(([statName, statValue]) => (
          <ThemedView key={`sub-${statName}`} style={styles.statRow}>
            <TextInput
              style={styles.statNameInput}
              value={statName}
              onChangeText={(text) => handleStatKeyChange('subStats', statName, text)}
            />
            <TextInput
              style={styles.statValueInput}
              value={String(statValue)}
              onChangeText={(text) => handleStatChange('subStats', statName, text)}
              keyboardType="numeric"
            />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveStat('subStats', statName)}
            >
              <ThemedText style={styles.removeButtonText}>×</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Action Buttons */}
      <ThemedView style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.saveButton]}
          onPress={handleSave}
        >
          <ThemedText style={styles.actionButtonText}>Save Changes</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onCancel}
        >
          <ThemedText style={styles.actionButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    width: 80,
    fontWeight: '500',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
  },
  levelControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decrementButton: {
    backgroundColor: '#e74c3c',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  incrementButton: {
    backgroundColor: '#2ecc71',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  levelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelInput: {
    width: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    height: 36,
  },
  maxLevelText: {
    marginLeft: 10,
    color: '#7f8c8d',
  },
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteIcon: {
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
  },
  statValueInput: {
    width: 70,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    width: 36,
    height: 36,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  cancelButton: {
    backgroundColor: '#7f8c8d',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RelicEditForm;