// hooks/useFavorite.js
import { useState, useCallback } from 'react';

// You would replace this with your actual API calls
import { updateRelicFavoriteStatus } from '@/api/relics'; 

export function useFavorite() {
  // Track any ongoing favorite operations
  const [pendingFavorites, setPendingFavorites] = useState({});

  // Toggle favorite status
  const toggleFavorite = useCallback(async (relicId, currentStatus) => {
    // Mark this relic as having a pending operation
    setPendingFavorites(prev => ({ ...prev, [relicId]: true }));
    
    try {
      // Call your API to update the favorite status
      await updateRelicFavoriteStatus(relicId, !currentStatus);
      
      // Return the new status (this allows the parent to update its state)
      return !currentStatus;
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      // Return the original status since the update failed
      return currentStatus;
    } finally {
      // Clear the pending state
      setPendingFavorites(prev => {
        const updated = { ...prev };
        delete updated[relicId];
        return updated;
      });
    }
  }, []);

  // Check if a specific relic has a pending favorite operation
  const isPending = useCallback((relicId) => {
    return !!pendingFavorites[relicId];
  }, [pendingFavorites]);

  return {
    toggleFavorite,
    isPending
  };
}