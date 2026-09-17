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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AreaCalculator'>;

interface Props {
    navigation: NavigationProp;
}

type Shape = 'rectangle' | 'circle' | 'triangle';
type Unit = 'm' | 'ft' | 'cm';

const TO_METERS: Record<Unit, number> = { m: 1, ft: 0.3048, cm: 0.01 };

function formatArea(n: number) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export default function AreaCalculatorScreen({ navigation }: Props) {
    const [shape, setShape] = useState<Shape>('rectangle');
    const [unit, setUnit] = useState<Unit>('m');
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [radius, setRadius] = useState('');
    const [base, setBase] = useState('');
    const [height, setHeight] = useState('');
    const insets = useSafeAreaInsets();

    const areaM2 = useMemo(() => {
        const toM = (raw: string) => (parseFloat(raw) || 0) * TO_METERS[unit];
        if (shape === 'rectangle') {
            const l = toM(length);
            const w = toM(width);
            if (l <= 0 || w <= 0) return null;
            return l * w;
        }
        if (shape === 'circle') {
            const r = toM(radius);
            if (r <= 0) return null;
            return Math.PI * r * r;
        }
        const b = toM(base);
        const h = toM(height);
        if (b <= 0 || h <= 0) return null;
        return (b * h) / 2;
    }, [shape, unit, length, width, radius, base, height]);

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
                        <Text style={styles.title}>Area Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionTitle}>Shape</Text>
                        <View style={styles.chipRow}>
                            {(
                                [
                                    ['rectangle', 'Rectangle'],
                                    ['circle', 'Circle'],
                                    ['triangle', 'Triangle'],
                                ] as [Shape, string][]
                            ).map(([id, label]) => (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.chip, shape === id && styles.chipActive]}
                                    onPress={() => setShape(id)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            shape === id && styles.chipTextActive,
                                        ]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Unit</Text>
                        <View style={styles.chipRow}>
                            {(
                                [
                                    ['m', 'Meters'],
                                    ['ft', 'Feet'],
                                    ['cm', 'Centimeters'],
                                ] as [Unit, string][]
                            ).map(([id, label]) => (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.chip, unit === id && styles.chipActive]}
                                    onPress={() => setUnit(id)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            unit === id && styles.chipTextActive,
                                        ]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {shape === 'rectangle' && (
                            <>
                                <View style={styles.card}>
                                    <Text style={styles.label}>Length</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor={COLORS.textMuted}
                                        keyboardType="decimal-pad"
                                        value={length}
                                        onChangeText={setLength}
                                    />
                                </View>
                                <View style={styles.card}>
                                    <Text style={styles.label}>Width</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor={COLORS.textMuted}
                                        keyboardType="decimal-pad"
                                        value={width}
                                        onChangeText={setWidth}
                                    />
                                </View>
                            </>
                        )}

                        {shape === 'circle' && (
                            <View style={styles.card}>
                                <Text style={styles.label}>Radius</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textMuted}
                                    keyboardType="decimal-pad"
                                    value={radius}
                                    onChangeText={setRadius}
                                />
                            </View>
                        )}

                        {shape === 'triangle' && (
                            <>
                                <View style={styles.card}>
                                    <Text style={styles.label}>Base</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor={COLORS.textMuted}
                                        keyboardType="decimal-pad"
                                        value={base}
                                        onChangeText={setBase}
                                    />
                                </View>
                                <View style={styles.card}>
                                    <Text style={styles.label}>Height</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor={COLORS.textMuted}
                                        keyboardType="decimal-pad"
                                        value={height}
                                        onChangeText={setHeight}
                                    />
                                </View>
                            </>
                        )}

                        {areaM2 !== null && (
                            <View style={styles.results}>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Square meters</Text>
                                    <Text style={[styles.resultValue, styles.totalValue]}>
                                        {formatArea(areaM2)} m²
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Square feet</Text>
                                    <Text style={styles.resultValue}>
                                        {formatArea(areaM2 * 10.7639)} ft²
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Marla (Pak)</Text>
                                    <Text style={styles.resultValue}>
                                        {formatArea(areaM2 / 25.2929)}
                                    </Text>
                                </View>
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
    sectionTitle: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.sm,
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
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
        marginBottom: SPACING.xl,
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
    resultValue: { color: COLORS.text, fontSize: SIZES.fontLg, fontWeight: '700' },
    totalValue: { color: COLORS.primaryLight },
});
