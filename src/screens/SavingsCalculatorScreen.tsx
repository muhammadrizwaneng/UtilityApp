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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SavingsCalculator'>;

interface Props {
    navigation: NavigationProp;
}

const COMPOUNDING = [
    { id: 1, label: 'Yearly' },
    { id: 4, label: 'Quarterly' },
    { id: 12, label: 'Monthly' },
    { id: 365, label: 'Daily' },
];

function formatMoney(n: number) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export default function SavingsCalculatorScreen({ navigation }: Props) {
    const [principal, setPrincipal] = useState('');
    const [rate, setRate] = useState('');
    const [years, setYears] = useState('5');
    const [contribution, setContribution] = useState('');
    const [compounds, setCompounds] = useState(12);
    const insets = useSafeAreaInsets();

    const result = useMemo(() => {
        const p = parseFloat(principal) || 0;
        const r = parseFloat(rate) || 0;
        const t = parseFloat(years) || 0;
        const pmt = parseFloat(contribution) || 0;
        if (p < 0 || t <= 0) return null;

        const n = compounds;
        const i = r / 100 / n;
        const periods = n * t;
        const pmtPerPeriod = pmt * (12 / n);
        let future: number;
        if (i === 0) {
            future = p + pmtPerPeriod * periods;
        } else {
            const growth = Math.pow(1 + i, periods);
            future = p * growth + pmtPerPeriod * ((growth - 1) / i);
        }
        const invested = p + pmt * 12 * t;
        return { future, invested, interest: future - invested };
    }, [principal, rate, years, contribution, compounds]);

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
                        <Text style={styles.title}>Savings Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>
                            <Text style={styles.label}>Starting amount</Text>
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
                            <Text style={styles.label}>Monthly contribution</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={contribution}
                                onChangeText={setContribution}
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>Annual interest rate (%)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={rate}
                                onChangeText={setRate}
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>Years</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="5"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={years}
                                onChangeText={setYears}
                            />
                        </View>

                        <Text style={styles.sectionTitle}>Compounding</Text>
                        <View style={styles.chipRow}>
                            {COMPOUNDING.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.chip,
                                        compounds === item.id && styles.chipActive,
                                    ]}
                                    onPress={() => setCompounds(item.id)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            compounds === item.id && styles.chipTextActive,
                                        ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {result && (
                            <View style={styles.results}>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Future value</Text>
                                    <Text style={[styles.resultValue, styles.totalValue]}>
                                        {formatMoney(result.future)}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Total invested</Text>
                                    <Text style={styles.resultValue}>
                                        {formatMoney(result.invested)}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Interest earned</Text>
                                    <Text style={[styles.resultValue, { color: COLORS.success }]}>
                                        {formatMoney(result.interest)}
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
