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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BmiCalculator'>;

interface Props {
    navigation: NavigationProp;
}

type UnitSystem = 'metric' | 'imperial';

function bmiCategory(bmi: number) {
    if (bmi < 18.5) return { label: 'Underweight', color: COLORS.info };
    if (bmi < 25) return { label: 'Normal', color: COLORS.success };
    if (bmi < 30) return { label: 'Overweight', color: COLORS.warning };
    return { label: 'Obese', color: COLORS.error };
}

export default function BmiCalculatorScreen({ navigation }: Props) {
    const [unit, setUnit] = useState<UnitSystem>('metric');
    const [weightKg, setWeightKg] = useState('');
    const [heightCm, setHeightCm] = useState('');
    const [weightLb, setWeightLb] = useState('');
    const [heightFt, setHeightFt] = useState('');
    const [heightIn, setHeightIn] = useState('');
    const insets = useSafeAreaInsets();

    const result = useMemo(() => {
        let kg = 0;
        let meters = 0;
        if (unit === 'metric') {
            kg = parseFloat(weightKg) || 0;
            meters = (parseFloat(heightCm) || 0) / 100;
        } else {
            kg = (parseFloat(weightLb) || 0) * 0.453592;
            const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
            meters = totalInches * 0.0254;
        }
        if (kg <= 0 || meters <= 0) return null;
        const bmi = kg / (meters * meters);
        return { bmi, category: bmiCategory(bmi) };
    }, [unit, weightKg, heightCm, weightLb, heightFt, heightIn]);

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
                        <Text style={styles.title}>BMI Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.chipRow}>
                            {(['metric', 'imperial'] as UnitSystem[]).map(u => (
                                <TouchableOpacity
                                    key={u}
                                    style={[styles.chip, unit === u && styles.chipActive]}
                                    onPress={() => setUnit(u)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            unit === u && styles.chipTextActive,
                                        ]}>
                                        {u === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lb/ft-in)'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {unit === 'metric' ? (
                            <>
                                <View style={styles.card}>
                                    <Text style={styles.label}>Weight (kg)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor={COLORS.textMuted}
                                        keyboardType="decimal-pad"
                                        value={weightKg}
                                        onChangeText={setWeightKg}
                                    />
                                </View>
                                <View style={styles.card}>
                                    <Text style={styles.label}>Height (cm)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor={COLORS.textMuted}
                                        keyboardType="decimal-pad"
                                        value={heightCm}
                                        onChangeText={setHeightCm}
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.card}>
                                    <Text style={styles.label}>Weight (lb)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor={COLORS.textMuted}
                                        keyboardType="decimal-pad"
                                        value={weightLb}
                                        onChangeText={setWeightLb}
                                    />
                                </View>
                                <View style={styles.dateRow}>
                                    <View style={[styles.card, styles.dateField]}>
                                        <Text style={styles.label}>Height (ft)</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="0"
                                            placeholderTextColor={COLORS.textMuted}
                                            keyboardType="decimal-pad"
                                            value={heightFt}
                                            onChangeText={setHeightFt}
                                        />
                                    </View>
                                    <View style={[styles.card, styles.dateField]}>
                                        <Text style={styles.label}>Height (in)</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="0"
                                            placeholderTextColor={COLORS.textMuted}
                                            keyboardType="decimal-pad"
                                            value={heightIn}
                                            onChangeText={setHeightIn}
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        {result && (
                            <View style={styles.bigCard}>
                                <Text style={styles.bigNumber}>{result.bmi.toFixed(1)}</Text>
                                <Text
                                    style={[
                                        styles.categoryText,
                                        { color: result.category.color },
                                    ]}>
                                    {result.category.label}
                                </Text>
                            </View>
                        )}

                        <View style={styles.infoCard}>
                            <Text style={styles.infoText}>Underweight: below 18.5</Text>
                            <Text style={styles.infoText}>Normal: 18.5 – 24.9</Text>
                            <Text style={styles.infoText}>Overweight: 25 – 29.9</Text>
                            <Text style={styles.infoText}>Obese: 30 and above</Text>
                        </View>
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
    chipRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.lg,
    },
    chip: {
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
    card: {
        marginTop: SPACING.lg,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    dateRow: { flexDirection: 'row', gap: SPACING.md },
    dateField: { flex: 1 },
    label: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    input: { fontSize: SIZES.font2xl, fontWeight: '700', color: COLORS.text, padding: 0 },
    bigCard: {
        marginTop: SPACING.xl,
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusLg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    bigNumber: { fontSize: 64, fontWeight: '700', color: COLORS.primaryLight },
    categoryText: { fontSize: SIZES.fontLg, fontWeight: '700', marginTop: SPACING.xs },
    infoCard: {
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
        padding: SPACING.lg,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.glass,
        gap: SPACING.xs,
    },
    infoText: { color: COLORS.textSecondary, fontSize: SIZES.fontSm },
});
