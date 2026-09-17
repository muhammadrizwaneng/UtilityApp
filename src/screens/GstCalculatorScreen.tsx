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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GstCalculator'>;

interface Props {
    navigation: NavigationProp;
}

type Mode = 'exclusive' | 'inclusive';

const TAX_PRESETS = [5, 12, 16, 18, 28];

function formatMoney(n: number) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export default function GstCalculatorScreen({ navigation }: Props) {
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState(18);
    const [mode, setMode] = useState<Mode>('exclusive');
    const insets = useSafeAreaInsets();

    const result = useMemo(() => {
        const value = parseFloat(amount);
        if (!(value > 0) || rate < 0) return null;
        if (mode === 'exclusive') {
            const tax = value * (rate / 100);
            return { net: value, tax, gross: value + tax };
        }
        const net = value / (1 + rate / 100);
        const tax = value - net;
        return { net, tax, gross: value };
    }, [amount, rate, mode]);

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
                        <Text style={styles.title}>GST / Tax Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.chipRow}>
                            {(
                                [
                                    ['exclusive', 'Add tax'],
                                    ['inclusive', 'Price includes tax'],
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
                            <Text style={styles.label}>
                                {mode === 'exclusive' ? 'Amount before tax' : 'Amount with tax'}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>

                        <Text style={styles.sectionTitle}>Tax rate %</Text>
                        <View style={styles.chipRow}>
                            {TAX_PRESETS.map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.chip, rate === p && styles.chipActive]}
                                    onPress={() => setRate(p)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            rate === p && styles.chipTextActive,
                                        ]}>
                                        {p}%
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.customRow}>
                            <Text style={styles.label}>Custom %</Text>
                            <TextInput
                                style={styles.smallInput}
                                keyboardType="decimal-pad"
                                value={String(rate)}
                                onChangeText={t => {
                                    const n = parseFloat(t.replace(/[^0-9.]/g, ''));
                                    setRate(Number.isFinite(n) ? Math.min(100, n) : 0);
                                }}
                            />
                        </View>

                        {result && (
                            <View style={styles.results}>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Net amount</Text>
                                    <Text style={styles.resultValue}>{formatMoney(result.net)}</Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Tax ({rate}%)</Text>
                                    <Text style={styles.resultValue}>{formatMoney(result.tax)}</Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Gross total</Text>
                                    <Text style={[styles.resultValue, styles.totalValue]}>
                                        {formatMoney(result.gross)}
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
    sectionTitle: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.sm,
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
    },
    customRow: {
        marginTop: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    smallInput: {
        width: 100,
        textAlign: 'center',
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusSm,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
        fontWeight: '700',
        paddingVertical: SPACING.sm,
    },
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
