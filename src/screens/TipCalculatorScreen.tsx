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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TipCalculator'>;

interface Props {
    navigation: NavigationProp;
}

const TIP_PRESETS = [10, 15, 18, 20, 25];

export default function TipCalculatorScreen({ navigation }: Props) {
    const [bill, setBill] = useState('');
    const [tipPercent, setTipPercent] = useState(15);
    const [people, setPeople] = useState('1');
    const insets = useSafeAreaInsets();

    const { tipAmount, total, perPerson } = useMemo(() => {
        const billNum = parseFloat(bill) || 0;
        const peopleNum = Math.max(1, parseInt(people, 10) || 1);
        const tip = billNum * (tipPercent / 100);
        const tot = billNum + tip;
        return {
            tipAmount: tip,
            total: tot,
            perPerson: tot / peopleNum,
        };
    }, [bill, tipPercent, people]);

    const formatMoney = (n: number) => n.toFixed(2);

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
                        <Text style={styles.title}>Tip Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>
                            <Text style={styles.label}>Bill Amount</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={bill}
                                onChangeText={setBill}
                            />
                        </View>

                        <Text style={styles.sectionTitle}>Tip %</Text>
                        <View style={styles.chipRow}>
                            {TIP_PRESETS.map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.chip, tipPercent === p && styles.chipActive]}
                                    onPress={() => setTipPercent(p)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            tipPercent === p && styles.chipTextActive,
                                        ]}>
                                        {p}%
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.customTip}>
                            <Text style={styles.label}>Custom tip %</Text>
                            <TextInput
                                style={styles.smallInput}
                                keyboardType="number-pad"
                                value={String(tipPercent)}
                                onChangeText={t => {
                                    const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
                                    setTipPercent(isNaN(n) ? 0 : Math.min(100, n));
                                }}
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>Split between</Text>
                            <View style={styles.peopleRow}>
                                <TouchableOpacity
                                    style={styles.roundBtn}
                                    onPress={() =>
                                        setPeople(p =>
                                            String(Math.max(1, (parseInt(p, 10) || 1) - 1)),
                                        )
                                    }>
                                    <Text style={styles.roundBtnText}>−</Text>
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.peopleInput}
                                    keyboardType="number-pad"
                                    value={people}
                                    onChangeText={setPeople}
                                />
                                <TouchableOpacity
                                    style={styles.roundBtn}
                                    onPress={() =>
                                        setPeople(p => String((parseInt(p, 10) || 1) + 1))
                                    }>
                                    <Text style={styles.roundBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.results}>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Tip</Text>
                                <Text style={styles.resultValue}>{formatMoney(tipAmount)}</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Total</Text>
                                <Text style={[styles.resultValue, styles.totalValue]}>
                                    {formatMoney(total)}
                                </Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Per person</Text>
                                <Text style={styles.resultValue}>{formatMoney(perPerson)}</Text>
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
    card: {
        marginTop: SPACING.lg,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    label: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    input: {
        fontSize: SIZES.font2xl,
        fontWeight: '700',
        color: COLORS.text,
        padding: 0,
    },
    sectionTitle: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.sm,
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    chip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.backgroundCard,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    chipTextActive: {
        color: COLORS.white,
    },
    customTip: {
        marginTop: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    smallInput: {
        width: 80,
        textAlign: 'center',
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusSm,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
        fontWeight: '700',
        paddingVertical: SPACING.sm,
    },
    peopleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    roundBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roundBtnText: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '700',
    },
    peopleInput: {
        flex: 1,
        textAlign: 'center',
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.text,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusSm,
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
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.fontMd,
        fontWeight: '600',
    },
    resultValue: {
        color: COLORS.text,
        fontSize: SIZES.fontXl,
        fontWeight: '700',
    },
    totalValue: {
        color: COLORS.primaryLight,
    },
});
