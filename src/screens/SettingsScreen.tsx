import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { clearAllNotes } from '../constants/notesStorage';
import { clearRatesCache } from '../constants/currencyRates';
import { RootStackParamList } from '../types';
import packageJson from '../../package.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
    navigation: NavigationProp;
}

export default function SettingsScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();

    const confirmClearNotes = () => {
        Alert.alert(
            'Clear all notes?',
            'This permanently deletes every note stored on this device. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear Notes',
                    style: 'destructive',
                    onPress: async () => {
                        await clearAllNotes();
                        Alert.alert('Done', 'All notes have been cleared.');
                    },
                },
            ],
        );
    };

    const confirmClearRatesCache = () => {
        Alert.alert(
            'Clear currency rate cache?',
            'The next time you open Currency Converter it will fetch fresh rates from the network.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear Cache',
                    style: 'destructive',
                    onPress: async () => {
                        await clearRatesCache();
                        Alert.alert('Done', 'Currency rate cache has been cleared.');
                    },
                },
            ],
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.gradient}>
                <View
                    style={[
                        styles.mainContainer,
                        {
                            paddingTop:
                                Math.max(
                                    insets.top,
                                    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
                                ) + SPACING.md,
                        },
                    ]}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}>
                            <Text style={styles.backText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Settings</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}>
                        <Text style={styles.sectionLabel}>Data Management</Text>
                        <View style={styles.card}>
                            <TouchableOpacity style={styles.row} onPress={confirmClearNotes}>
                                <View style={styles.rowText}>
                                    <Text style={styles.rowTitle}>Clear all notes</Text>
                                    <Text style={styles.rowHint}>
                                        Delete every note saved on this device
                                    </Text>
                                </View>
                                <Text style={styles.rowIcon}>🗑️</Text>
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TouchableOpacity style={styles.row} onPress={confirmClearRatesCache}>
                                <View style={styles.rowText}>
                                    <Text style={styles.rowTitle}>Clear currency rate cache</Text>
                                    <Text style={styles.rowHint}>
                                        Force a fresh fetch of exchange rates
                                    </Text>
                                </View>
                                <Text style={styles.rowIcon}>💱</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionLabel}>About</Text>
                        <View style={styles.card}>
                            <View style={styles.row}>
                                <View style={styles.rowText}>
                                    <Text style={styles.rowTitle}>Utility Hub</Text>
                                    <Text style={styles.rowHint}>
                                        All your everyday tools in one app
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.row}>
                                <Text style={styles.rowTitle}>Version</Text>
                                <Text style={styles.rowHint}>{packageJson.version}</Text>
                            </View>
                        </View>
                    </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backText: {
        fontSize: 28,
        color: COLORS.text,
    },
    title: {
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.text,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    sectionLabel: {
        fontSize: SIZES.fontSm,
        fontWeight: '700',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: SPACING.xl,
        marginBottom: SPACING.sm,
    },
    card: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
    },
    rowText: {
        flex: 1,
        marginRight: SPACING.md,
    },
    rowTitle: {
        fontSize: SIZES.fontMd,
        fontWeight: '600',
        color: COLORS.text,
    },
    rowHint: {
        marginTop: 2,
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
    },
    rowIcon: {
        fontSize: 20,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: SPACING.lg,
    },
});
