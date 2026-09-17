import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FuelCalculator'>;

interface Props {
    navigation: NavigationProp;
}

type Mode = 'trip' | 'mileage';

function formatNumber(n: number) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export default function FuelCalculatorScreen({ navigation }: Props) {
    const [mode, setMode] = useState<Mode>('trip');
    const [distance, setDistance] = useState('');
    const [mileage, setMileage] = useState('');
    const [price, setPrice] = useState('');
    const [fuelUsed, setFuelUsed] = useState('');
    const insets = useSafeAreaInsets();

    const tripResult = useMemo(() => {
        if (mode !== 'trip') return null;
        const km = parseFloat(distance);
        const kml = parseFloat(mileage);
        const p = parseFloat(price);
        if (!(km > 0) || !(kml > 0) || !(p >= 0)) return null;
        const liters = km / kml;
        return { liters, cost: liters * p };
    }, [mode, distance, mileage, price]);

    const mileageResult = useMemo(() => {
        if (mode !== 'mileage') return null;
        const km = parseFloat(distance);
        const liters = parseFloat(fuelUsed);
        const p = parseFloat(price) || 0;
        if (!(km > 0) || !(liters > 0)) return null;
        const kml = km / liters;
        return { kml, lPer100: 100 / kml, cost: liters * p };
    }, [mode, distance, fuelUsed, price]);

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
                        <Text style={styles.title}>Fuel Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.chipRow}>
                            {(
                                [
                                    ['trip', 'Trip cost'],
                                    ['mileage', 'Mileage from trip'],
                                ] as [Mode, string][]
                            ).map(([id, label]) => (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.chip, mode === id && styles.chipActive]}
                                    onPress={() => setMode(id)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            mode === id && styles.chipTextActive,
                                        ]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>Distance (km)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={distance}
                                onChangeText={setDistance}
                            />
                        </View>

                        {mode === 'trip' ? (
                            <View style={styles.card}>
                                <Text style={styles.label}>Mileage (km per liter)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textMuted}
                                    keyboardType="decimal-pad"
                                    value={mileage}
                                    onChangeText={setMileage}
                                />
                            </View>
                        ) : (
                            <View style={styles.card}>
                                <Text style={styles.label}>Fuel used (liters)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textMuted}
                                    keyboardType="decimal-pad"
                                    value={fuelUsed}
                                    onChangeText={setFuelUsed}
                                />
                            </View>
                        )}

                        <View style={styles.card}>
                            <Text style={styles.label}>Fuel price (per liter)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={price}
                                onChangeText={setPrice}
                            />
                        </View>

                        {tripResult && (
                            <View style={styles.results}>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Fuel needed</Text>
                                    <Text style={styles.resultValue}>
                                        {formatNumber(tripResult.liters)} L
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Trip cost</Text>
                                    <Text style={[styles.resultValue, styles.totalValue]}>
                                        {formatNumber(tripResult.cost)}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {mileageResult && (
                            <View style={styles.results}>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Mileage</Text>
                                    <Text style={[styles.resultValue, styles.totalValue]}>
                                        {formatNumber(mileageResult.kml)} km/L
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Consumption</Text>
                                    <Text style={styles.resultValue}>
                                        {formatNumber(mileageResult.lPer100)} L/100km
                                    </Text>
                                </View>
                                {parseFloat(price) > 0 && (
                                    <View style={styles.resultRow}>
                                        <Text style={styles.resultLabel}>Fuel cost</Text>
                                        <Text style={styles.resultValue}>
                                            {formatNumber(mileageResult.cost)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    gradient: { flex: 1 },
    mainContainer: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 28, color: COLORS.text },
    title: { fontSize: SIZES.fontXl, fontWeight: '700', color: COLORS.text },
    placeholder: { width: 40 },
    content: { flex: 1, paddingHorizontal: SPACING.lg },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.lg },
    chip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.backgroundCard,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { color: COLORS.textSecondary, fontWeight: '600' },
    chipTextActive: { color: COLORS.white },
    card: {
        marginTop: SPACING.lg,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    label: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    input: { fontSize: SIZES.font2xl, fontWeight: '700', color: COLORS.text, padding: 0 },
    results: {
        marginTop: SPACING.xl,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.md,
        ...SHADOWS.medium,
    },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    resultLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontMd, fontWeight: '600' },
    resultValue: { color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: '700' },
    totalValue: { color: COLORS.primaryLight },
});
