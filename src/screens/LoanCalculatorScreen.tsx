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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoanCalculator'>;

interface Props {
    navigation: NavigationProp;
}

const TENURE_PRESETS = [12, 24, 36, 60, 120];

export default function LoanCalculatorScreen({ navigation }: Props) {
    const [principal, setPrincipal] = useState('');
    const [rate, setRate] = useState('');
    const [months, setMonths] = useState('12');
    const insets = useSafeAreaInsets();

    const result = useMemo(() => {
        const p = parseFloat(principal) || 0;
        const annualRate = parseFloat(rate) || 0;
        const n = parseInt(months, 10) || 0;
        if (p <= 0 || n <= 0) return null;

        const monthlyRate = annualRate / 12 / 100;
        let emi: number;
        if (monthlyRate === 0) {
            emi = p / n;
        } else {
            const factor = Math.pow(1 + monthlyRate, n);
            emi = (p * monthlyRate * factor) / (factor - 1);
        }
        const totalPayment = emi * n;
        const totalInterest = totalPayment - p;
        return { emi, totalPayment, totalInterest };
    }, [principal, rate, months]);

    const formatMoney = (n: number) =>
        n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });

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
                        <Text style={styles.title}>Loan / EMI Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>
                            <Text style={styles.label}>Loan Amount</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={principal}
                                onChangeText={setPrincipal}
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>Annual Interest Rate (%)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={rate}
                                onChangeText={setRate}
                            />
                        </View>

                        <Text style={styles.sectionTitle}>Tenure (months)</Text>
                        <View style={styles.chipRow}>
                            {TENURE_PRESETS.map(m => (
                                <TouchableOpacity
                                    key={m}
                                    style={[styles.chip, months === String(m) && styles.chipActive]}
                                    onPress={() => setMonths(String(m))}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            months === String(m) && styles.chipTextActive,
                                        ]}>
                                        {m}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.customTip}>
                            <Text style={styles.label}>Custom months</Text>
                            <TextInput
                                style={styles.smallInput}
                                keyboardType="number-pad"
                                value={months}
                                onChangeText={t => setMonths(t.replace(/[^0-9]/g, ''))}
                            />
                        </View>

                        {result && (
                            <View style={styles.results}>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Monthly EMI</Text>
                                    <Text style={[styles.resultValue, styles.totalValue]}>
                                        {formatMoney(result.emi)}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Total Interest</Text>
                                    <Text style={styles.resultValue}>
                                        {formatMoney(result.totalInterest)}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Total Payment</Text>
                                    <Text style={styles.resultValue}>
                                        {formatMoney(result.totalPayment)}
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
    customTip: {
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
    resultValue: { color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: '700' },
    totalValue: { color: COLORS.primaryLight },
});
