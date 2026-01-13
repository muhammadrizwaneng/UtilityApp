import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    StatusBar,
    Platform,
    Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import UtilityCard from '../components/UtilityCard';
import { UTILITIES } from '../constants/utilities';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import { RootStackParamList, Utility } from '../types';

const LOGO = require('../assets/logo.png');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const insets = useSafeAreaInsets();

    const filteredUtilities = UTILITIES.filter(
        (utility: Utility) =>
            utility.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            utility.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleUtilityPress = (utility: Utility) => {
        navigation.navigate(utility.screen as keyof RootStackParamList);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.gradient}>
                <View style={[styles.mainContainer, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + SPACING.md }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Utility Hub</Text>
                            <Text style={styles.subtitle}>All your tools in one place</Text>
                        </View>
                        <Image source={LOGO} style={styles.logo} />
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchInputWrapper}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search utilities..."
                                placeholderTextColor={COLORS.textMuted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                selectionColor={COLORS.primary}
                            />
                        </View>
                    </View>

                    {/* Utilities Grid */}
                    <FlatList
                        data={filteredUtilities}
                        keyExtractor={item => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingBottom: insets.bottom + SPACING.xl }
                        ]}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <UtilityCard
                                title={item.title}
                                description={item.description}
                                icon={item.icon}
                                gradient={item.gradient}
                                onPress={() => handleUtilityPress(item)}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No utilities found</Text>
                            </View>
                        }
                    />
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    gradient: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.md,
    },
    title: {
        fontSize: SIZES.font3xl,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: SIZES.fontMd,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    logo: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    searchContainer: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        marginTop: SPACING.md,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusLg,
        paddingHorizontal: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
    },
    row: {
        justifyContent: 'space-between',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl,
    },
    emptyText: {
        fontSize: SIZES.fontLg,
        color: COLORS.textMuted,
    },
});
