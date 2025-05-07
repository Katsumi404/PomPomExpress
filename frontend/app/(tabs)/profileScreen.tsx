import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useConfig } from '@/contexts/ConfigContext';
import { RelicCard, PaginationControls, setOnPressFavorite } from '@/components/relics/RelicComponents'; // Import the RelicCard and PaginationControls
import RelicDetailsModal from '@/components/relics/RelicDetailsModal'; // Import the Modal

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
    // Add additional fields from the full relic
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
    tags?: Array<{ id: string; name: string }>;
    releaseDate?: string;
    imageUrl?: string;
    schemaVersion?: string;
    updatedAt?: string | null;
}

interface User {
    firstName: string;
    lastName: string;
    email: string;
    birthday: string;
    profilePicture?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    getProfile: () => Promise<void>;
    logout: () => Promise<void>;
}

export default function ProfileScreen(): JSX.Element {
    const { user, loading, getProfile, logout } = useAuth() as AuthContextType;
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme];
    const { apiUrl } = useConfig();

    // State for user's relics
    const [userRelics, setUserRelics] = useState<UserRelic[]>([]);
    const [relicsLoading, setRelicsLoading] = useState<boolean>(false); // Separate loading state for relics
    const [relicsError, setRelicsError] = useState<string | null>(null);   // Separate error state for relics
    const [selectedUserRelic, setSelectedUserRelic] = useState<UserRelic | null>(null);
    const [selectedRelicDetails, setSelectedRelicDetails] = useState<RelicDetails | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [updatingRelic, setUpdatingRelic] = useState<boolean>(false);
    const [removingRelic, setRemovingRelic] = useState<boolean>(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const itemsPerPage = 5;

    // Function to format the birthday date
    const formatDate = (date: string) => {
        const formattedDate = new Date(date);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(formattedDate);
    };

    // Fetch user's relics
    const fetchUserRelics = useCallback(async (): Promise<void> => {
        if (!user || !user.id) {
            setRelicsError("User not authenticated. Please log in.");
            setRelicsLoading(false);
            return;
        }

        try {
            setRelicsLoading(true);
            const response = await axios.get<UserRelic[]>(`${apiUrl}/users/getUserRelics/${user.id}`, {
                timeout: 5000,
            });

            // Fetch relic details and merge
            const relicsWithDetails = await Promise.all(
                response.data.map(async (userRelic) => {
                    try {
                        const detailsResponse = await axios.get<RelicDetails>(
                            `${apiUrl}/db/getRelics/${userRelic.relicId}`,
                            { timeout: 3000 }
                        );
                        return {
                            ...userRelic,
                            name: detailsResponse.data.name || "Unknown Relic",
                            setName: detailsResponse.data.setName,
                            description: detailsResponse.data.description,
                            imageUrl: detailsResponse.data.imageUrl,
                            rarity: detailsResponse.data.rarity || userRelic.rarity,
                        };
                    } catch (error) {
                        console.warn(`Failed to fetch details for relic ${userRelic.relicId}:`, error);
                        return userRelic;
                    }
                })
            );

            setUserRelics(relicsWithDetails);
            setTotalPages(Math.ceil(relicsWithDetails.length / itemsPerPage));
            setCurrentPage(1);
            setRelicsLoading(false);
        } catch (error) {
            console.error('Fetch relics error:', error);
            setRelicsError('Failed to fetch your relics. Please try again later.');
            setRelicsLoading(false);
        }
    }, [apiUrl, user]);

    // Fetch relic details for modal
    const fetchRelicDetails = async (relicId: string, userRelic: UserRelic): Promise<void> => {
        try {
            const response = await axios.get<RelicDetails>(`${apiUrl}/db/getRelics/${relicId}`, {
                timeout: 5000,
            });
            setSelectedRelicDetails(response.data);
            setSelectedUserRelic(userRelic);
            setModalVisible(true);
        } catch (error) {
            console.error('Fetch relic details error:', error);
            setRelicsError('Failed to fetch relic details. Please try again later.');
        }
    };

    // Update relic
    const updateUserRelic = async (id: string, updates: Partial<UserRelic>): Promise<void> => {
        if (!user || !user.id) {
            Alert.alert('Authentication Required', 'Please log in to update relics.');
            return;
        }

        try {
            setUpdatingRelic(true);
            await axios.put(`${apiUrl}/users/updateUserRelic/${id}`, {
                userId: user.id,
                ...updates
            }, { timeout: 5000 });

            setUserRelics(prev => prev.map(relic =>
                relic._id === id ? { ...relic, ...updates } : relic
            ));
            Alert.alert('Success', 'Relic updated!');
            setUpdatingRelic(false);
        } catch (error) {
            console.error('Update relic error:', error);
            Alert.alert('Error', 'Failed to update relic.');
            setUpdatingRelic(false);
        }
    };

    // Remove relic
    const removeUserRelic = async (relicId: string): Promise<void> => {
        if (!user || !user.id) {
            Alert.alert('Authentication Required', 'Please log in to remove relics.');
            return;
        }

        try {
            setRemovingRelic(true);
            await axios.delete(`${apiUrl}/users/removeRelicFromCollection/${user.id}/${relicId}`, {
                timeout: 5000
            });

            setUserRelics(prev => prev.filter(relic => relic._id !== relicId));
            setModalVisible(false);
            Alert.alert('Success', 'Relic removed!');
            setRemovingRelic(false);
        } catch (error) {
            console.error('Remove relic error:', error);
            Alert.alert('Error', 'Failed to remove relic.');
            setRemovingRelic(false);
        }
    };

    // Handle page change
    const handlePageChange = (page: number): void => {
        setCurrentPage(page);
    };

    // Toggle favorite status
    const toggleFavorite = (id: string, currentStatus: boolean): void => {
        updateUserRelic(id, { isFavorite: !currentStatus });
    };

    // Set onPressFavorite.  This is used by the RelicCard.
    useEffect(() => {
        setOnPressFavorite(toggleFavorite);
    }, [toggleFavorite]);

    // Get current page items
    const getCurrentPageItems = (): UserRelic[] => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return userRelics.slice(startIndex, endIndex);
    };

    // Fetch profile and relics on mount/user change
    useEffect(() => {
        if (!user && !loading) {
            getProfile().catch((error: Error) => {
                console.error('Failed to fetch user profile:', error);
            });
        }
    }, [user, loading, getProfile]);

    useEffect(() => {
        if (user) {
            fetchUserRelics();
        }
    }, [user, fetchUserRelics]);

    // Empty Collection component
    const EmptyCollection = (): JSX.Element => (
        <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="box-open" size={80} color="#808080" />
            <ThemedText style={styles.emptyText}>Your relic collection is empty</ThemedText>
            <ThemedText style={styles.emptySubtext}>
                Visit the Relics screen to add some relics to your collection
            </ThemedText>
        </ThemedView>
    );

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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <IconSymbol
                    size={50}
                    color={themeColors.tint}
                    name="user-circle"
                    style={styles.profileIcon}
                />
                <View style={styles.userInfo}>
                    <ThemedText type="title" style={styles.userName}>
                        {user.firstName} {user.lastName}
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.userEmail}>
                        {user.email}
                    </ThemedText>
                    <ThemedText type="default" style={styles.userBirthday}>
                        🎂 Birthday: {formatDate(user.birthday)}
                    </ThemedText>
                </View>
            </View>

            {/* Edit Profile Button */}
            <Button
                title="Edit Profile"
                onPress={() => console.log('Navigate to Edit Profile Screen')}
                color={Colors.primary}
            />

            <View style={styles.logoutContainer}>
                <Button
                    title="Logout"
                    onPress={async () => await logout()}
                    color={Colors.danger}
                />
            </View>

            <ThemedText type="title" style={styles.relicCollectionTitle}>
                My Relic Collection
            </ThemedText>

            {relicsLoading ? (
                <View style={styles.relicsLoadingContainer}>
                    <ActivityIndicator size="large" color={themeColors.tint} />
                    <ThemedText style={styles.loadingText}>Loading your relics...</ThemedText>
                </View>
            ) : relicsError ? (
                <ThemedView style={styles.relicsErrorContainer}>
                    <ThemedText style={[styles.errorMessage, { color: Colors.danger }]}>
                        {relicsError}
                    </ThemedText>
                </ThemedView>
            ) : userRelics.length === 0 ? (
                <EmptyCollection />
            ) : (
                <View>
                    {getCurrentPageItems().map((relic) => (
                        <RelicCard
                            key={relic._id}
                            relic={relic}
                            onPress={() => fetchRelicDetails(relic.relicId, relic)} // Pass the userRelic
                        />
                    ))}
                    {userRelics.length > itemsPerPage && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </View>
            )}

            <RelicDetailsModal
                relic={selectedRelicDetails}
                userRelic={selectedUserRelic}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onUpdateRelic={updateUserRelic}
                onRemoveRelic={removeUserRelic}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 20,
    },
    profileIcon: {
        marginRight: 16,
    },
    userInfo: {
        flexDirection: 'column',
    },
    userName: {
        fontSize: 22,
    },
    userEmail: {
        fontSize: 14,
    },
    userBirthday: {
        fontSize: 14,
        marginTop: 4,
    },
    logoutContainer: {
        marginTop: 20,
    },
    errorMessage: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 30,
    },
    relicCollectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10
    },
    relicsLoadingContainer: {
        marginTop: 20,
        alignItems: 'center'
    },
    relicsErrorContainer: {
        marginTop: 20
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        marginTop: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        color: '#808080',
    },
    loadingText: {
        marginTop: 12,
    },
});
