import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorldClock'>;

interface Props {
    navigation: NavigationProp;
}

const CITIES = [
    { city: 'Karachi', zone: 'Asia/Karachi' },
    { city: 'Dubai', zone: 'Asia/Dubai' },
    { city: 'Riyadh', zone: 'Asia/Riyadh' },
    { city: 'Istanbul', zone: 'Europe/Istanbul' },
    { city: 'London', zone: 'Europe/London' },
    { city: 'New York', zone: 'America/New_York' },
    { city: 'Toronto', zone: 'America/Toronto' },
    { city: 'Singapore', zone: 'Asia/Singapore' },
    { city: 'Tokyo', zone: 'Asia/Tokyo' },
    { city: 'Sydney', zone: 'Australia/Sydney' },
];

function tzOffsetMinutes(timeZone: string, date: Date) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(date);
    const map: Record<string, string> = {};
    for (const p of parts) {
        if (p.type !== 'literal') map[p.type] = p.value;
    }
    const asUtc = Date.UTC(
        Number(map.year),
        Number(map.month) - 1,
        Number(map.day),
        Number(map.hour),
        Number(map.minute),
        Number(map.second),
    );
    return (asUtc - date.getTime()) / 60000;
}

function clockFor(zone: string, now: Date, withSeconds: boolean) {
    const time = now.toLocaleTimeString(undefined, {
        timeZone: zone,
        hour: '2-digit',
        minute: '2-digit',
        second: withSeconds ? '2-digit' : undefined,
        hour12: true,
    });
    const date = now.toLocaleDateString(undefined, {
        timeZone: zone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    return { time, date };
}

function hoursAhead(zone: string, now: Date, localZone: string) {
    const diffMin = Math.round(tzOffsetMinutes(zone, now) - tzOffsetMinutes(localZone, now));
    const hours = diffMin / 60;
    if (hours === 0) return 'Same time';
    const label = Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
    return hours > 0 ? `+${label}h` : `${label}h`;
}

export default function WorldClockScreen({ navigation }: Props) {
    const [now, setNow] = useState(() => new Date());
    const insets = useSafeAreaInsets();
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const local = useMemo(() => clockFor(localZone, now, true), [localZone, now]);

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
                        <Text style={styles.title}>World Clock</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.localCard}>
                            <Text style={styles.localLabel}>Your time · {localZone.replace(/_/g, ' ')}</Text>
                            <Text style={styles.localTime}>{local.time}</Text>
                            <Text style={styles.localDate}>{local.date}</Text>
                        </View>

                        {CITIES.map(item => {
                            const clock = clockFor(item.zone, now, false);
                            return (
                                <View key={item.zone} style={styles.cityRow}>
                                    <View style={styles.cityText}>
                                        <Text style={styles.cityName}>{item.city}</Text>
                                        <Text style={styles.cityMeta}>
                                            {clock.date} · {hoursAhead(item.zone, now, localZone)}
                                        </Text>
                                    </View>
                                    <Text style={styles.cityTime}>{clock.time}</Text>
                                </View>
                            );
                        })}
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
    localCard: {
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    localLabel: { color: COLORS.textMuted, fontSize: SIZES.fontSm, fontWeight: '600' },
    localTime: {
        marginTop: 6,
        color: COLORS.primaryLight,
        fontSize: SIZES.font3xl,
        fontWeight: '800',
    },
    localDate: { marginTop: 4, color: COLORS.textSecondary, fontSize: SIZES.fontMd },
    cityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        marginTop: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cityText: { flex: 1, marginRight: SPACING.md },
    cityName: { color: COLORS.text, fontSize: SIZES.fontLg, fontWeight: '700' },
    cityMeta: { color: COLORS.textMuted, fontSize: SIZES.fontSm, marginTop: 2 },
    cityTime: { color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: '700' },
});
