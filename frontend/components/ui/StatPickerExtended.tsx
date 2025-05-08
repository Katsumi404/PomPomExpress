import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface StatPickerProps {
  selectedStat: string;
  onChange: (stat: string) => void;
  stats: string[];
  label?: string;
}

export const StatPickerExtended: React.FC<StatPickerProps> = ({ selectedStat, onChange, stats, label }) => (
  <View style={styles.wrapper}>
    {label && <Text style={styles.label}>{label}</Text>}
    <Picker
      selectedValue={selectedStat}
      onValueChange={onChange}
      style={styles.picker}
      dropdownIconColor="#888"
    >
      {stats.map(stat => (
        <Picker.Item key={stat} label={stat} value={stat} />
      ))}
    </Picker>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
});
