import React, { useState } from 'react';
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

interface ConversionUnit {
    name: string;
    symbol: string;
    toBase?: number;
}

interface ConversionCategory {
    name: string;
    units: Record<string, ConversionUnit>;
}

const CONVERSION_CATEGORIES: Record<string, ConversionCategory> = {
    length: {
        name: 'Length',
        units: {
            meter: { name: 'Meter', symbol: 'm', toBase: 1 },
            kilometer: { name: 'Kilometer', symbol: 'km', toBase: 1000 },
            centimeter: { name: 'Centimeter', symbol: 'cm', toBase: 0.01 },
            millimeter: { name: 'Millimeter', symbol: 'mm', toBase: 0.001 },
            mile: { name: 'Mile', symbol: 'mi', toBase: 1609.34 },
            yard: { name: 'Yard', symbol: 'yd', toBase: 0.9144 },
            foot: { name: 'Foot', symbol: 'ft', toBase: 0.3048 },
            inch: { name: 'Inch', symbol: 'in', toBase: 0.0254 },
        },
    },
    weight: {
        name: 'Weight',
        units: {
            kilogram: { name: 'Kilogram', symbol: 'kg', toBase: 1 },
            gram: { name: 'Gram', symbol: 'g', toBase: 0.001 },
            milligram: { name: 'Milligram', symbol: 'mg', toBase: 0.000001 },
            pound: { name: 'Pound', symbol: 'lb', toBase: 0.453592 },
            ounce: { name: 'Ounce', symbol: 'oz', toBase: 0.0283495 },
        },
    },
    temperature: {
        name: 'Temperature',
        units: {
            celsius: { name: 'Celsius', symbol: '°C' },
            fahrenheit: { name: 'Fahrenheit', symbol: '°F' },
            kelvin: { name: 'Kelvin', symbol: 'K' },
        },
    },
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UnitConverter'>;

interface Props {
    navigation: NavigationProp;
}

export default function UnitConverterScreen({ navigation }: Props) {
    const [category, setCategory] = useState('length');
    const [fromUnit, setFromUnit] = useState('meter');
    const [toUnit, setToUnit] = useState('kilometer');
    const [fromValue, setFromValue] = useState('');
    const [toValue, setToValue] = useState('');
    const insets = useSafeAreaInsets();

    const convertValue = (value: string, from: string, to: string, cat: string) => {
        if (!value || isNaN(parseFloat(value))) return '';

        const numValue = parseFloat(value);

        if (cat === 'temperature') {
            // Temperature conversions
            let celsius = 0;
            if (from === 'celsius') celsius = numValue;
            else if (from === 'fahrenheit') celsius = (numValue - 32) * (5 / 9);
            else if (from === 'kelvin') celsius = numValue - 273.15;

            let result = 0;
            if (to === 'celsius') result = celsius;
            else if (to === 'fahrenheit') result = celsius * (9 / 5) + 32;
            else if (to === 'kelvin') result = celsius + 273.15;

            return result.toFixed(2);
        } else {
            // Other conversions
            const units = CONVERSION_CATEGORIES[cat].units;
            const fromBase = units[from].toBase || 1;
            const toBase = units[to].toBase || 1;
            const baseValue = numValue * fromBase;
            const result = baseValue / toBase;
            return result.toFixed(4);
        }
    };

    const handleFromValueChange = (value: string) => {
        setFromValue(value);
        const converted = convertValue(value, fromUnit, toUnit, category);
        setToValue(converted);
    };

    const swapUnits = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
        setFromValue(toValue);
        setToValue(fromValue);
    };

    const currentUnits = CONVERSION_CATEGORIES[category].units;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.gradient}>
                <View style={[styles.mainContainer, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + SPACING.md }]}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}>
                            <Text style={styles.backText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Unit Converter</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Category Tabs */}
                        <View style={styles.tabContainer}>
                            {Object.keys(CONVERSION_CATEGORIES).map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.tab,
                                        category === cat && styles.activeTab,
                                    ]}
                                    onPress={() => {
                                        setCategory(cat);
                                        const units = Object.keys(CONVERSION_CATEGORIES[cat].units);
                                        setFromUnit(units[0]);
                                        setToUnit(units[1] || units[0]);
                                        setFromValue('');
                                        setToValue('');
                                    }}>
                                    <Text
                                        style={[
                                            styles.tabText,
                                            category === cat && styles.activeTabText,
                                        ]}>
                                        {CONVERSION_CATEGORIES[cat].name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* From Unit */}
                        <View style={styles.converterCard}>
                            <Text style={styles.label}>From</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={fromValue}
                                    onChangeText={handleFromValueChange}
                                    keyboardType="numeric"
                                />
                                <View style={styles.unitSelector}>
                                    <Text style={styles.unitText}>
                                        {currentUnits[fromUnit].symbol}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Swap Button */}
                        <TouchableOpacity style={styles.swapButton} onPress={swapUnits}>
                            <Text style={styles.swapIcon}>⇅</Text>
                        </TouchableOpacity>

                        {/* To Unit */}
                        <View style={styles.converterCard}>
                            <Text style={styles.label}>To</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.input, styles.resultInput]}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={toValue}
                                    editable={false}
                                />
                                <View style={styles.unitSelector}>
                                    <Text style={styles.unitText}>
                                        {currentUnits[toUnit].symbol}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Unit Selection */}
                        <View style={styles.unitListContainer}>
                            <Text style={styles.sectionTitle}>Select Units</Text>
                            <View style={styles.unitGrid}>
                                {Object.keys(currentUnits).map(unit => (
                                    <TouchableOpacity
                                        key={unit}
                                        style={[
                                            styles.unitButton,
                                            (fromUnit === unit || toUnit === unit) &&
                                            styles.selectedUnit,
                                        ]}
                                        onPress={() => {
                                            if (fromUnit === unit) return;
                                            setToUnit(unit);
                                            if (fromValue) {
                                                const converted = convertValue(
                                                    fromValue,
                                                    fromUnit,
                                                    unit,
                                                    category,
                                                );
                                                setToValue(converted);
                                            }
                                        }}>
                                        <Text style={styles.unitButtonText}>
                                            {currentUnits[unit].name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
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
    tabContainer: {
        flexDirection: 'row',
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
        gap: SPACING.sm,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.backgroundCard,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    tabText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.white,
    },
    converterCard: {
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
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    input: {
        flex: 1,
        fontSize: SIZES.font2xl,
        fontWeight: '700',
        color: COLORS.text,
        padding: 0,
    },
    resultInput: {
        color: COLORS.primary,
    },
    unitSelector: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusSm,
    },
    unitText: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    swapButton: {
        alignSelf: 'center',
        marginVertical: SPACING.md,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    swapIcon: {
        fontSize: 24,
        color: COLORS.white,
    },
    unitListContainer: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    unitGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    unitButton: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusSm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    selectedUnit: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    unitButtonText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
});
