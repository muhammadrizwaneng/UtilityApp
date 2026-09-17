import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DateCalculator'>;

interface Props {
    navigation: NavigationProp;
}

type Mode = 'difference' | 'addSubtract';

function parseDateFields(day: string, month: string, year: string): Date | null {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!d || !m || !y) return null;
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1 || y > 9999) return null;
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
        return null;
    }
    return date;
}

function formatDate(date: Date) {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
        2,
        '0',
    )}/${date.getFullYear()}`;
}

export default function DateCalculatorScreen({ navigation }: Props) {
    const [mode, setMode] = useState<Mode>('difference');
    const insets = useSafeAreaInsets();

    // Difference mode fields
    const [startDay, setStartDay] = useState('');
    const [startMonth, setStartMonth] = useState('');
    const [startYear, setStartYear] = useState('');
    const [endDay, setEndDay] = useState('');
    const [endMonth, setEndMonth] = useState('');
    const [endYear, setEndYear] = useState('');

    // Add/Subtract mode fields
    const [baseDay, setBaseDay] = useState('');
    const [baseMonth, setBaseMonth] = useState('');
    const [baseYear, setBaseYear] = useState('');
    const [offsetDays, setOffsetDays] = useState('');
    const [operation, setOperation] = useState<'add' | 'subtract'>('add');

    const diffResult = useMemo(() => {
        if (mode !== 'difference') return null;
        const start = parseDateFields(startDay, startMonth, startYear);
        const end = parseDateFields(endDay, endMonth, endYear);
        if (!start || !end) return null;
        const msPerDay = 1000 * 60 * 60 * 24;
        const totalDays = Math.round((end.getTime() - start.getTime()) / msPerDay);
        const weeks = Math.floor(Math.abs(totalDays) / 7);
        const remDays = Math.abs(totalDays) % 7;
        return { totalDays, weeks, remDays };
    }, [mode, startDay, startMonth, startYear, endDay, endMonth, endYear]);

    const addResult = useMemo(() => {
        if (mode !== 'addSubtract') return null;
        const base = parseDateFields(baseDay, baseMonth, baseYear);
        const offset = parseInt(offsetDays, 10);
        if (!base || !offset) return null;
        const result = new Date(base);
        result.setDate(result.getDate() + (operation === 'add' ? offset : -offset));
        return result;
    }, [mode, baseDay, baseMonth, baseYear, offsetDays, operation]);

    const renderDateInputs = (
        day: string,
        setDay: (v: string) => void,
        month: string,
        setMonth: (v: string) => void,
        year: string,
        setYear: (v: string) => void,
    ) => (
        <View style={styles.dateRow}>
            <View style={styles.dateField}>
                <Text style={styles.label}>Day</Text>
                <TextInput
                    style={styles.input}
                    placeholder="DD"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={day}
                    onChangeText={t => setDay(t.replace(/[^0-9]/g, ''))}
                />
            </View>
            <View style={styles.dateField}>
                <Text style={styles.label}>Month</Text>
                <TextInput
                    style={styles.input}
                    placeholder="MM"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={month}
                    onChangeText={t => setMonth(t.replace(/[^0-9]/g, ''))}
                />
            </View>
            <View style={[styles.dateField, styles.yearField]}>
                <Text style={styles.label}>Year</Text>
                <TextInput
                    style={styles.input}
                    placeholder="YYYY"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    value={year}
                    onChangeText={t => setYear(t.replace(/[^0-9]/g, ''))}
                />
            </View>
        </View>
    );

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
                        <Text style={styles.title}>Date Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.chipRow}>
                            {(['difference', 'addSubtract'] as Mode[]).map(m => (
                                <TouchableOpacity
                                    key={m}
                                    style={[styles.modeChip, mode === m && styles.chipActive]}
                                    onPress={() => setMode(m)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            mode === m && styles.chipTextActive,
                                        ]}>
                                        {m === 'difference' ? 'Days Between' : 'Add / Subtract'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {mode === 'difference' ? (
                            <>
                                <Text style={styles.sectionTitle}>Start Date</Text>
                                {renderDateInputs(
                                    startDay,
                                    setStartDay,
                                    startMonth,
                                    setStartMonth,
                                    startYear,
                                    setStartYear,
                                )}
                                <Text style={styles.sectionTitle}>End Date</Text>
                                {renderDateInputs(
                                    endDay,
                                    setEndDay,
                                    endMonth,
                                    setEndMonth,
                                    endYear,
                                    setEndYear,
                                )}

                                {diffResult && (
                                    <View style={styles.results}>
                                        <View style={styles.bigCard}>
                                            <Text style={styles.bigNumber}>
                                                {Math.abs(diffResult.totalDays)}
                                            </Text>
                                            <Text style={styles.bigLabel}>
                                                Day{Math.abs(diffResult.totalDays) === 1 ? '' : 's'}
                                                {diffResult.totalDays < 0 ? ' (in the past)' : ''}
                                            </Text>
                                        </View>
                                        <View style={styles.infoCard}>
                                            <Text style={styles.infoText}>
                                                {diffResult.weeks} week
                                                {diffResult.weeks === 1 ? '' : 's'} and{' '}
                                                {diffResult.remDays} day
                                                {diffResult.remDays === 1 ? '' : 's'}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </>
                        ) : (
                            <>
                                <Text style={styles.sectionTitle}>Start Date</Text>
                                {renderDateInputs(
                                    baseDay,
                                    setBaseDay,
                                    baseMonth,
                                    setBaseMonth,
                                    baseYear,
                                    setBaseYear,
                                )}

                                <View style={styles.chipRow}>
                                    {(['add', 'subtract'] as const).map(op => (
                                        <TouchableOpacity
                                            key={op}
                                            style={[
                                                styles.modeChip,
                                                operation === op && styles.chipActive,
                                            ]}
                                            onPress={() => setOperation(op)}>
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    operation === op && styles.chipTextActive,
                                                ]}>
                                                {op === 'add' ? 'Add Days' : 'Subtract Days'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.card}>
                                    <Text style={styles.label}>Number of Days</Text>
                                    <TextInput
                                        style={styles.numberInput}
                                        placeholder="0"
                                        placeholderTextColor={COLORS.textMuted}
                                        keyboardType="number-pad"
                                        value={offsetDays}
                                        onChangeText={t => setOffsetDays(t.replace(/[^0-9]/g, ''))}
                                    />
                                </View>

                                {addResult && (
                                    <View style={styles.bigCard}>
                                        <Text style={styles.resultDate}>
                                            {formatDate(addResult)}
                                        </Text>
                                        <Text style={styles.bigLabel}>
                                            {addResult.toLocaleDateString(undefined, {
                                                weekday: 'long',
                                            })}
                                        </Text>
                                    </View>
                                )}
                            </>
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
    chipRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
    modeChip: {
        flex: 1,
        paddingVertical: SPACING.sm,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.backgroundCard,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: SIZES.fontSm },
    chipTextActive: { color: COLORS.white },
    sectionTitle: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.md,
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
    },
    dateRow: { flexDirection: 'row', gap: SPACING.sm },
    dateField: { flex: 1 },
    yearField: { flex: 1.4 },
    label: { color: COLORS.textMuted, marginBottom: SPACING.xs, fontSize: SIZES.fontSm },
    input: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        textAlign: 'center',
        paddingVertical: SPACING.md,
    },
    card: {
        marginTop: SPACING.lg,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    numberInput: {
        fontSize: SIZES.font2xl,
        fontWeight: '700',
        color: COLORS.text,
        padding: 0,
    },
    results: { marginTop: SPACING.xl, marginBottom: SPACING.xl, gap: SPACING.md },
    bigCard: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusLg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    bigNumber: { fontSize: 64, fontWeight: '700', color: COLORS.primaryLight },
    resultDate: { fontSize: SIZES.font2xl, fontWeight: '700', color: COLORS.primaryLight },
    bigLabel: {
        fontSize: SIZES.fontLg,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginTop: SPACING.xs,
    },
    infoCard: {
        padding: SPACING.lg,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.glass,
    },
    infoText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.fontMd,
        textAlign: 'center',
        fontWeight: '600',
    },
});
