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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SalaryCalculator'>;

interface Props {
    navigation: NavigationProp;
}

type Mode = 'hourly' | 'monthly';

function formatMoney(n: number) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export default function SalaryCalculatorScreen({ navigation }: Props) {
    const [mode, setMode] = useState<Mode>('monthly');
    const [amount, setAmount] = useState('');
    const [hoursPerDay, setHoursPerDay] = useState('8');
    const [daysPerWeek, setDaysPerWeek] = useState('5');
    const insets = useSafeAreaInsets();

    const result = useMemo(() => {
        const pay = parseFloat(amount);
        const hours = parseFloat(hoursPerDay);
        const days = parseFloat(daysPerWeek);
        if (!(pay > 0) || !(hours > 0) || !(days > 0) || days > 7) return null;

        const hoursPerWeek = hours * days;
        const hoursPerYear = hoursPerWeek * 52;
        const hoursPerMonth = hoursPerYear / 12;

        if (mode === 'hourly') {
            return {
                hourly: pay,
                daily: pay * hours,
                weekly: pay * hoursPerWeek,
                monthly: pay * hoursPerMonth,
                yearly: pay * hoursPerYear,
            };
        }
        return {
            hourly: pay / hoursPerMonth,
            daily: (pay / hoursPerMonth) * hours,
            weekly: (pay * 12) / 52,
            monthly: pay,
            yearly: pay * 12,
        };
    }, [mode, amount, hoursPerDay, daysPerWeek]);

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
                        <Text style={styles.title}>Salary Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.chipRow}>
                            {(
                                [
                                    ['monthly', 'I know monthly pay'],
                                    ['hourly', 'I know hourly rate'],
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
                                {mode === 'hourly' ? 'Hourly rate' : 'Monthly salary'}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>Hours per day</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="8"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={hoursPerDay}
                                onChangeText={setHoursPerDay}
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>Working days per week</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="5"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={daysPerWeek}
                                onChangeText={setDaysPerWeek}
                            />
                        </View>

                        {result && (
                            <View style={styles.results}>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Hourly</Text>
                                    <Text style={styles.resultValue}>
                                        {formatMoney(result.hourly)}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Daily</Text>
                                    <Text style={styles.resultValue}>
                                        {formatMoney(result.daily)}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Weekly</Text>
                                    <Text style={styles.resultValue}>
                                        {formatMoney(result.weekly)}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Monthly</Text>
                                    <Text style={[styles.resultValue, styles.totalValue]}>
                                        {formatMoney(result.monthly)}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Yearly</Text>
                                    <Text style={styles.resultValue}>
                                        {formatMoney(result.yearly)}
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
