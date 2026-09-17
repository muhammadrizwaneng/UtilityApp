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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PercentageCalculator'>;

interface Props {
    navigation: NavigationProp;
}

type Mode = 'of' | 'isWhat' | 'change';

function formatNumber(n: number) {
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

export default function PercentageCalculatorScreen({ navigation }: Props) {
    const [mode, setMode] = useState<Mode>('of');
    const [valueA, setValueA] = useState('');
    const [valueB, setValueB] = useState('');
    const insets = useSafeAreaInsets();

    const result = useMemo(() => {
        const a = parseFloat(valueA);
        const b = parseFloat(valueB);
        if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

        if (mode === 'of') {
            return {
                main: (a / 100) * b,
                hint: `${formatNumber(a)}% of ${formatNumber(b)}`,
            };
        }
        if (mode === 'isWhat') {
            if (b === 0) return null;
            return {
                main: (a / b) * 100,
                suffix: '%',
                hint: `${formatNumber(a)} is this percent of ${formatNumber(b)}`,
            };
        }
        if (a === 0) return null;
        const diff = b - a;
        const percent = (diff / a) * 100;
        return {
            main: percent,
            suffix: '%',
            extra: diff,
            hint: percent >= 0 ? 'Increase from original' : 'Decrease from original',
        };
    }, [mode, valueA, valueB]);

    const labels =
        mode === 'of'
            ? { a: 'Percent (%)', b: 'Of this number' }
            : mode === 'isWhat'
              ? { a: 'This number', b: 'Is what % of' }
              : { a: 'Original value', b: 'New value' };

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
                        <Text style={styles.title}>Percentage Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.chipRow}>
                            {(
                                [
                                    ['of', '% of a number'],
                                    ['isWhat', 'X is what %'],
                                    ['change', 'Increase / decrease'],
                                ] as [Mode, string][]
                            ).map(([id, label]) => (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.chip, mode === id && styles.chipActive]}
                                    onPress={() => {
                                        setMode(id);
                                        setValueA('');
                                        setValueB('');
                                    }}>
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
                            <Text style={styles.label}>{labels.a}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={valueA}
                                onChangeText={setValueA}
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>{labels.b}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={valueB}
                                onChangeText={setValueB}
                            />
                        </View>

                        {result && (
                            <View style={styles.results}>
                                <Text style={styles.resultHint}>{result.hint}</Text>
                                <Text style={styles.resultMain}>
                                    {formatNumber(result.main)}
                                    {result.suffix ?? ''}
                                </Text>
                                {result.extra !== undefined && (
                                    <View style={styles.resultRow}>
                                        <Text style={styles.resultLabel}>Difference</Text>
                                        <Text style={styles.resultValue}>
                                            {result.extra > 0 ? '+' : ''}
                                            {formatNumber(result.extra)}
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
        ...SHADOWS.medium,
    },
    resultHint: { color: COLORS.textMuted, fontSize: SIZES.fontSm, marginBottom: SPACING.sm },
    resultMain: {
        color: COLORS.primaryLight,
        fontSize: SIZES.font3xl,
        fontWeight: '800',
    },
    resultRow: {
        marginTop: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontMd, fontWeight: '600' },
    resultValue: { color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: '700' },
});
