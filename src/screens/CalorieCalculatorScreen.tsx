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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CalorieCalculator'>;

interface Props {
    navigation: NavigationProp;
}

type Sex = 'male' | 'female';
type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very';

const ACTIVITY: { id: Activity; label: string; factor: number }[] = [
    { id: 'sedentary', label: 'Sedentary', factor: 1.2 },
    { id: 'light', label: 'Light', factor: 1.375 },
    { id: 'moderate', label: 'Moderate', factor: 1.55 },
    { id: 'active', label: 'Active', factor: 1.725 },
    { id: 'very', label: 'Very active', factor: 1.9 },
];

export default function CalorieCalculatorScreen({ navigation }: Props) {
    const [sex, setSex] = useState<Sex>('male');
    const [age, setAge] = useState('');
    const [weightKg, setWeightKg] = useState('');
    const [heightCm, setHeightCm] = useState('');
    const [activity, setActivity] = useState<Activity>('moderate');
    const insets = useSafeAreaInsets();

    const result = useMemo(() => {
        const years = parseFloat(age);
        const kg = parseFloat(weightKg);
        const cm = parseFloat(heightCm);
        if (!(years > 0) || !(kg > 0) || !(cm > 0)) return null;

        const bmr =
            sex === 'male'
                ? 10 * kg + 6.25 * cm - 5 * years + 5
                : 10 * kg + 6.25 * cm - 5 * years - 161;
        const factor = ACTIVITY.find(a => a.id === activity)?.factor ?? 1.55;
        const tdee = bmr * factor;
        return {
            bmr,
            tdee,
            lose: Math.max(tdee - 500, 1200),
            gain: tdee + 300,
        };
    }, [sex, age, weightKg, heightCm, activity]);

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
                        <Text style={styles.title}>Calorie Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionTitle}>Sex</Text>
                        <View style={styles.chipRow}>
                            {(
                                [
                                    ['male', 'Male'],
                                    ['female', 'Female'],
                                ] as [Sex, string][]
                            ).map(([id, label]) => (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.chip, sex === id && styles.chipActive]}
                                    onPress={() => setSex(id)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            sex === id && styles.chipTextActive,
                                        ]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>Age (years)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="number-pad"
                                value={age}
                                onChangeText={setAge}
                            />
                        </View>
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

                        <Text style={styles.sectionTitle}>Activity</Text>
                        <View style={styles.chipRow}>
                            {ACTIVITY.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.chip, activity === item.id && styles.chipActive]}
                                    onPress={() => setActivity(item.id)}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            activity === item.id && styles.chipTextActive,
                                        ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {result && (
                            <View style={styles.results}>
                                <Text style={styles.resultHint}>Mifflin–St Jeor estimate</Text>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>BMR</Text>
                                    <Text style={styles.resultValue}>
                                        {Math.round(result.bmr)} kcal
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Maintain</Text>
                                    <Text style={[styles.resultValue, styles.totalValue]}>
                                        {Math.round(result.tdee)} kcal
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Lose weight</Text>
                                    <Text style={styles.resultValue}>
                                        {Math.round(result.lose)} kcal
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Gain weight</Text>
                                    <Text style={styles.resultValue}>
                                        {Math.round(result.gain)} kcal
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
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.md,
        ...SHADOWS.medium,
    },
    resultHint: { color: COLORS.textMuted, fontSize: SIZES.fontSm },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    resultLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontMd, fontWeight: '600' },
    resultValue: { color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: '700' },
    totalValue: { color: COLORS.primaryLight },
});
