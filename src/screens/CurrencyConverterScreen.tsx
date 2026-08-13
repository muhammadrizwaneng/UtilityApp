import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import {
    CURRENCY_META,
    CURRENCY_CODES,
    FALLBACK_RATES,
    convertCurrency,
    getRates,
    RatesPayload,
} from '../constants/currencyRates';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CurrencyConverter'>;

interface Props {
    navigation: NavigationProp;
}

export default function CurrencyConverterScreen({ navigation }: Props) {
    const [fromCode, setFromCode] = useState('USD');
    const [toCode, setToCode] = useState('EUR');
    const [fromValue, setFromValue] = useState('1');
    const [toValue, setToValue] = useState('');
    const [selecting, setSelecting] = useState<'from' | 'to' | null>(null);
    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [updatedAt, setUpdatedAt] = useState('Loading latest rates...');
    const [source, setSource] = useState<RatesPayload['source']>('fallback');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();
    const conversionRef = useRef({ fromValue: '1', fromCode: 'USD', toCode: 'EUR' });

    useEffect(() => {
        conversionRef.current = { fromValue, fromCode, toCode };
    }, [fromValue, fromCode, toCode]);

    const recalculate = useCallback(
        (value: string, from: string, to: string, nextRates: Record<string, number>) => {
            const num = parseFloat(value);
            if (value === '' || isNaN(num)) {
                setToValue('');
                return;
            }
            setToValue(convertCurrency(num, from, to, nextRates).toFixed(4));
        },
        [],
    );

    const applyRates = useCallback(
        (payload: RatesPayload) => {
            setRates(payload.rates);
            setUpdatedAt(payload.updatedAt);
            setSource(payload.source);
            const current = conversionRef.current;
            recalculate(current.fromValue, current.fromCode, current.toCode, payload.rates);
        },
        [recalculate],
    );

    const loadRates = useCallback(
        async (fresh: boolean) => {
            if (fresh) setRefreshing(true);
            else setLoading(true);
            try {
                const payload = await getRates(fresh);
                applyRates(payload);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [applyRates],
    );

    useEffect(() => {
        loadRates(true);
    }, [loadRates]);

    const updateFrom = (value: string) => {
        setFromValue(value);
        recalculate(value, fromCode, toCode, rates);
    };

    const applyCodes = (from: string, to: string, amountStr: string) => {
        setFromCode(from);
        setToCode(to);
        recalculate(amountStr, from, to, rates);
    };

    const swap = () => {
        setFromCode(toCode);
        setToCode(fromCode);
        setFromValue(toValue);
        setToValue(fromValue);
    };

    const pickCurrency = (code: string) => {
        if (selecting === 'from') {
            applyCodes(code, toCode === code ? fromCode : toCode, fromValue);
        } else if (selecting === 'to') {
            applyCodes(fromCode === code ? toCode : fromCode, code, fromValue);
        }
        setSelecting(null);
    };

    const statusLabel =
        source === 'live'
            ? `Live rates · ${updatedAt}`
            : source === 'cache'
              ? `Cached rates · ${updatedAt}`
              : `Fallback rates · ${updatedAt}`;

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
                        <Text style={styles.title}>Currency</Text>
                        <TouchableOpacity
                            onPress={() => loadRates(true)}
                            style={styles.refreshButton}
                            disabled={refreshing || loading}>
                            <Text style={styles.refreshText}>{refreshing ? '…' : '↻'}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.statusRow}>
                            {(loading || refreshing) && (
                                <ActivityIndicator
                                    size="small"
                                    color={COLORS.primaryLight}
                                    style={styles.statusSpinner}
                                />
                            )}
                            <Text style={styles.note}>{statusLabel}</Text>
                        </View>

                        <View style={styles.converterCard}>
                            <Text style={styles.label}>From</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={fromValue}
                                    onChangeText={updateFrom}
                                    keyboardType="decimal-pad"
                                />
                                <TouchableOpacity
                                    style={styles.unitSelector}
                                    onPress={() => setSelecting('from')}>
                                    <Text style={styles.unitText}>{fromCode}</Text>
                                    <Text style={styles.chevron}>▼</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.currencyName}>
                                {CURRENCY_META[fromCode]?.name}
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.swapButton} onPress={swap}>
                            <Text style={styles.swapIcon}>⇅</Text>
                        </TouchableOpacity>

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
                                <TouchableOpacity
                                    style={styles.unitSelector}
                                    onPress={() => setSelecting('to')}>
                                    <Text style={styles.unitText}>{toCode}</Text>
                                    <Text style={styles.chevron}>▼</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.currencyName}>
                                {CURRENCY_META[toCode]?.name}
                            </Text>
                        </View>

                        <View style={styles.rateCard}>
                            <Text style={styles.rateText}>
                                1 {fromCode} ={' '}
                                {convertCurrency(1, fromCode, toCode, rates).toFixed(4)} {toCode}
                            </Text>
                        </View>

                        {selecting && (
                            <View style={styles.unitListContainer}>
                                <Text style={styles.sectionTitle}>
                                    Select {selecting === 'from' ? 'From' : 'To'} Currency
                                </Text>
                                <View style={styles.unitGrid}>
                                    {CURRENCY_CODES.map(code => (
                                        <TouchableOpacity
                                            key={code}
                                            style={[
                                                styles.unitButton,
                                                (selecting === 'from'
                                                    ? fromCode
                                                    : toCode) === code && styles.selectedUnit,
                                            ]}
                                            onPress={() => pickCurrency(code)}>
                                            <Text style={styles.unitButtonCode}>{code}</Text>
                                            <Text style={styles.unitButtonName}>
                                                {CURRENCY_META[code].symbol}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
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
    refreshButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshText: {
        fontSize: 24,
        color: COLORS.primaryLight,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    statusRow: {
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.sm,
    },
    statusSpinner: {
        marginRight: SPACING.sm,
    },
    note: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
        textAlign: 'center',
        flexShrink: 1,
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusSm,
    },
    unitText: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        fontWeight: '700',
    },
    chevron: {
        fontSize: 10,
        color: COLORS.textMuted,
    },
    currencyName: {
        marginTop: SPACING.sm,
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
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
    rateCard: {
        marginTop: SPACING.lg,
        padding: SPACING.md,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.glass,
        alignItems: 'center',
    },
    rateText: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        fontWeight: '600',
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
        width: '31%',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.sm,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusSm,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    selectedUnit: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    unitButtonCode: {
        fontSize: SIZES.fontSm,
        color: COLORS.text,
        fontWeight: '700',
    },
    unitButtonName: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
        marginTop: 2,
    },
});
