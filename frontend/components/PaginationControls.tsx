import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const scheme = useColorScheme();
  const theme = Colors[scheme || 'light'];

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
        <ThemedText
          style={[
            styles.paginationButtonText,
            { color: 'white' },
            currentPage === 1 && { color: theme.secondaryText },
          ]}
        >
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
        <ThemedText
          style={[
            styles.paginationButtonText,
            { color: 'white' },
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
  paginationButtonText: {
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

export default PaginationControls;