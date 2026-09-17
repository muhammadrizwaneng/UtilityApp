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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DiscountCalculator'>;

interface Props {
    navigation: NavigationProp;
}

const DISCOUNT_PRESETS = [10, 20, 25, 30, 50];

export default function DiscountCalculatorScreen({ navigation }: Props) {
    const [price, setPrice] = useState('');
    const [discount, setDiscount] = useState(10);
    const [tax, setTax] = useState('');
    const insets = useSafeAreaInsets();

    const result = useMemo(() => {
        const p = parseFloat(price) || 0;
        if (p <= 0) return null;
        const taxPercent = parseFloat(tax) || 0;
        const discountAmount = p * (discount / 100);
        const priceAfterDiscount = p - discountAmount;
        const taxAmount = priceAfterDiscount * (taxPercent / 100);
        const finalPrice = priceAfterDiscount + taxAmount;
        return { discountAmount, priceAfterDiscount, taxAmount, finalPrice };
    }, [price, discount, tax]);

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
                        <Text style={styles.title}>Discount Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>
                            <Text style={styles.label}>Original Price</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={price}
                                onChangeText={setPrice}
                            />
                        </View>

                        <Text style={styles.sectionTitle}>Discount %</Text>
                        <View style={styles.chipRow}>
                            {DISCOUNT_PRESETS.map(d => (
                                <TouchableOpacity
                                    key={d}
                                    style={[styles.chip, discount === d && styles.chipActive]}
                                    onPress={() => setDiscount(d)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            discount === d && styles.chipTextActive,
                                        ]}>
                                        {d}%
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.customTip}>
                            <Text style={styles.label}>Custom discount %</Text>
                            <TextInput
                                style={styles.smallInput}
                                keyboardType="number-pad"
                                value={String(discount)}
                                onChangeText={t => {
                                    const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
                                    setDiscount(isNaN(n) ? 0 : Math.min(100, n));
                                }}
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>Sales Tax % (optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={tax}
                                onChangeText={setTax}
                            />
                        </View>

                        {result && (
                            <View style={styles.results}>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>You Save</Text>
                                    <Text style={[styles.resultValue, styles.saveValue]}>
                                        {formatMoney(result.discountAmount)}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>After Discount</Text>
                                    <Text style={styles.resultValue}>
                                        {formatMoney(result.priceAfterDiscount)}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Tax</Text>
                                    <Text style={styles.resultValue}>
                                        {formatMoney(result.taxAmount)}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Final Price</Text>
                                    <Text style={[styles.resultValue, styles.totalValue]}>
                                        {formatMoney(result.finalPrice)}
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
    saveValue: { color: COLORS.success },
    totalValue: { color: COLORS.primaryLight },
});
