import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StyleSheet, Image, Platform, View } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://10.202.139.27:3000/db', {
        params: { 
          limit: 10 // Increased to show more listings
        },
        timeout: 5000, 
      });
      setListings(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to fetch listings. Please try again later.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const ListingCard = ({ listing }) => (
    <ThemedView style={styles.card}>
      <ThemedText type="title" style={styles.listingTitle}>
        {listing.name}
      </ThemedText>
      
      <ThemedView style={styles.detailsContainer}>
        <ThemedText type="defaultSemiBold" style={styles.propertyType}>
          {listing.property_type} · {listing.room_type}
        </ThemedText>
        
        <ThemedText style={styles.description}>
          {listing.description}
        </ThemedText>

        <ThemedView style={styles.statsContainer}>
          <ThemedText>
            {listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''} · 
            Accommodates {listing.accommodates}
          </ThemedText>
        </ThemedView>

        <Collapsible title="More Details">
          <ThemedView style={styles.additionalDetails}>
            <ThemedText>• Access: {listing.access}</ThemedText>
            <ThemedText>• Transit: {listing.transit}</ThemedText>
            <ThemedText>• House Rules: {listing.house_rules}</ThemedText>
            <ThemedText>
              • Cancellation: {listing.cancellation_policy}
            </ThemedText>
            <ThemedText>
              • Minimum Stay: {listing.minimum_nights} nights
            </ThemedText>
          </ThemedView>
        </Collapsible>

        <ExternalLink 
          style={styles.linkButton}
          href={listing.listing_url}>
          View on Airbnb
        </ExternalLink>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      {isLoading ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText>Loading listings...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.container}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Available Listings</ThemedText>
          </ThemedView>
          
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
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
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  card: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  listingTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  detailsContainer: {
    gap: 12,
  },
  propertyType: {
    color: '#666',
  },
  description: {
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  additionalDetails: {
    gap: 8,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
  }
});