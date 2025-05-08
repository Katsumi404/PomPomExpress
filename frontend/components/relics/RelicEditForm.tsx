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
import { StatPicker } from '@/components/ui/StatPicker'; 

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
  pieceType?: string;
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
  pieceType?: string; // Added pieceType field
}

interface RelicEditFormProps {
  relic: RelicDetails | null;
  userRelic: UserRelic;
  onSave: (formData: Partial<UserRelic>) => void;
  onCancel: () => void;
}

// Define relic piece types for Honkai Star Rail
const RELIC_PIECE_TYPES = [
  // Relic pieces (4-piece sets)
  'Head', 
  'Hands', 
  'Body', 
  'Feet',
  // Ornament pieces (2-piece sets)
  'Planar Sphere',
  'Link Rope'
];

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
    pieceType: userRelic?.pieceType || 'Head', // Default to Head if not specified
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
        pieceType: userRelic.pieceType || 'Head', 
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
    if (statType === 'mainStats' && Object.keys(formData.mainStats).length >= 1) {
      return; 
    }
  
    if (statType === 'subStats' && Object.keys(formData.subStats).length >= 4) {
      return; 
    }
  
    const newStatKey = `${statType} Stat ${Date.now()}`; // Generate unique key for each new stat
    setFormData(prev => ({
      ...prev,
      [statType]: {
        ...prev[statType],
        [newStatKey]: 0  
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

  // Handle piece type change
  const handlePieceTypeChange = (pieceType: string) => {
    setFormData(prev => ({
      ...prev,
      pieceType
    }));
  };

  // Handle save button
  const handleSave = () => {
    onSave(formData);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Piece Type Picker */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Piece Type: <ThemedText style={styles.currentValue}>{formData.pieceType}</ThemedText>
        </ThemedText>
        <ThemedView style={styles.pieceTypeContainer}>
          {RELIC_PIECE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.pieceTypeButton,
                formData.pieceType === type && styles.selectedPieceType
              ]}
              onPress={() => handlePieceTypeChange(type)}
            >
              <ThemedText 
                style={[
                  styles.pieceTypeText,
                  formData.pieceType === type && styles.selectedPieceTypeText
                ]}
              >
                {type}
              </ThemedText>
            </TouchableOpacity>
          ))}
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
            <StatPicker
              selectedStat={statName}
              onChange={(newStat) => handleStatKeyChange('mainStats', statName, newStat)}
              stats={['HP', 'Attack', 'Defense', 'Speed', 'Crit Rate', 'Crit Damage', 'Effect Hit Rate', 'Effect RES', 'Break Effect']}
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

      {/* Substats Section */}
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
            <StatPicker
              selectedStat={statName}
              onChange={(newStat) => handleStatKeyChange('subStats', statName, newStat)}
              stats={['HP', 'Attack', 'Defense', 'Speed', 'Crit Rate', 'Crit Damage', 'Effect Hit Rate', 'Effect RES', 'Break Effect']}
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

      {/* Level Section */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Level</ThemedText>
        <ThemedView style={styles.levelControlContainer}>
          <TouchableOpacity
            style={[styles.levelButton, styles.decrementButton]}
            onPress={() => {
              if ((formData.level || 1) > 1) {
                handleLevelChange(String((formData.level || 1) - 1));
              }
            }}
          >
            <ThemedText style={styles.levelButtonText}>-</ThemedText>
          </TouchableOpacity>
          
          <TextInput
            style={styles.levelInput}
            value={String(formData.level || 1)}
            onChangeText={handleLevelChange}
            keyboardType="numeric"
          />
          
          <TouchableOpacity
            style={[styles.levelButton, styles.incrementButton]}
            onPress={() => {
              if ((formData.level || 1) < 15) {
                handleLevelChange(String((formData.level || 1) + 1));
              }
            }}
          >
            <ThemedText style={styles.levelButtonText}>+</ThemedText>
          </TouchableOpacity>
          
          <ThemedText style={styles.maxLevelText}>Max: 15</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Favorite Section */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.favoriteContainer}>
          <ThemedText style={styles.label}>Favorite:</ThemedText>
          <Switch
            value={formData.isFavorite || false}
            onValueChange={(value) => handleInputChange('isFavorite', value)}
          />
        </ThemedView>
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
  pieceTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pieceTypeButton: {
    width: '48%',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedPieceType: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  pieceTypeText: {
    fontSize: 14,
  },
  selectedPieceTypeText: {
    color: '#fff',
    fontWeight: 'bold',
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