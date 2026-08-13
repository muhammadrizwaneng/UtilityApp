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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AgeCalculator'>;

interface Props {
    navigation: NavigationProp;
}

function daysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
}

function calcAge(birth: Date, today = new Date()) {
    if (birth > today) return null;

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
        months -= 1;
        const prevMonth = today.getMonth() === 0 ? 12 : today.getMonth();
        const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
        days += daysInMonth(prevYear, prevMonth);
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysToBirthday = Math.ceil(
        (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    return { years, months, days, totalDays, daysToBirthday };
}

export default function AgeCalculatorScreen({ navigation }: Props) {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const insets = useSafeAreaInsets();

    const result = useMemo(() => {
        const d = parseInt(day, 10);
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);
        if (!d || !m || !y) return null;
        if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > new Date().getFullYear()) {
            return { error: 'Enter a valid date of birth' };
        }
        const birth = new Date(y, m - 1, d);
        if (
            birth.getFullYear() !== y ||
            birth.getMonth() !== m - 1 ||
            birth.getDate() !== d
        ) {
            return { error: 'That date does not exist' };
        }
        const age = calcAge(birth);
        if (!age) return { error: 'Birth date cannot be in the future' };
        return { age };
    }, [day, month, year]);

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
                        <Text style={styles.title}>Age Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionTitle}>Date of Birth</Text>
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

                        {result && 'error' in result && (
                            <Text style={styles.error}>{result.error}</Text>
                        )}

                        {result && 'age' in result && result.age && (
                            <View style={styles.results}>
                                <View style={styles.bigCard}>
                                    <Text style={styles.bigNumber}>{result.age.years}</Text>
                                    <Text style={styles.bigLabel}>Years</Text>
                                </View>
                                <View style={styles.smallRow}>
                                    <View style={styles.smallCard}>
                                        <Text style={styles.smallNumber}>{result.age.months}</Text>
                                        <Text style={styles.smallLabel}>Months</Text>
                                    </View>
                                    <View style={styles.smallCard}>
                                        <Text style={styles.smallNumber}>{result.age.days}</Text>
                                        <Text style={styles.smallLabel}>Days</Text>
                                    </View>
                                </View>
                                <View style={styles.infoCard}>
                                    <Text style={styles.infoText}>
                                        You have lived {result.age.totalDays.toLocaleString()} days
                                    </Text>
                                    <Text style={styles.infoText}>
                                        Next birthday in {result.age.daysToBirthday} day
                                        {result.age.daysToBirthday === 1 ? '' : 's'}
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
    sectionTitle: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.md,
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
    },
    dateRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    dateField: {
        flex: 1,
    },
    yearField: {
        flex: 1.4,
    },
    label: {
        color: COLORS.textMuted,
        marginBottom: SPACING.xs,
        fontSize: SIZES.fontSm,
    },
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
    error: {
        marginTop: SPACING.lg,
        color: COLORS.error,
        textAlign: 'center',
        fontWeight: '600',
    },
    results: {
        marginTop: SPACING.xl,
        gap: SPACING.md,
    },
    bigCard: {
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusLg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    bigNumber: {
        fontSize: 64,
        fontWeight: '700',
        color: COLORS.primaryLight,
    },
    bigLabel: {
        fontSize: SIZES.fontLg,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    smallRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    smallCard: {
        flex: 1,
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    smallNumber: {
        fontSize: SIZES.font2xl,
        fontWeight: '700',
        color: COLORS.text,
    },
    smallLabel: {
        color: COLORS.textMuted,
        marginTop: 4,
    },
    infoCard: {
        padding: SPACING.lg,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.glass,
        gap: SPACING.sm,
    },
    infoText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.fontMd,
        textAlign: 'center',
        fontWeight: '600',
    },
});
