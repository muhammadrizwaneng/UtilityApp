import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
    FlatList,
    Alert,
    KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { COUNTDOWN_KEY } from '../constants/countdownStorage';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Countdown'>;

interface Props {
    navigation: NavigationProp;
}

interface EventItem {
    id: string;
    title: string;
    targetAt: number;
}

function parseDateFields(day: string, month: string, year: string): Date | null {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!d || !m || !y) return null;
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1 || y > 9999) return null;
    const date = new Date(y, m - 1, d, 0, 0, 0, 0);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
        return null;
    }
    return date;
}

function remainingParts(targetAt: number, now: number) {
    const diff = targetAt - now;
    if (diff <= 0) return null;
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
}

export default function CountdownScreen({ navigation }: Props) {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [title, setTitle] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [now, setNow] = useState(() => Date.now());
    const insets = useSafeAreaInsets();

    const load = useCallback(async () => {
        const raw = await AsyncStorage.getItem(COUNTDOWN_KEY);
        if (!raw) return;
        try {
            const parsed: EventItem[] = JSON.parse(raw);
            setEvents(parsed.sort((a, b) => a.targetAt - b.targetAt));
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const persist = async (next: EventItem[]) => {
        const sorted = [...next].sort((a, b) => a.targetAt - b.targetAt);
        setEvents(sorted);
        await AsyncStorage.setItem(COUNTDOWN_KEY, JSON.stringify(sorted));
    };

    const addEvent = () => {
        const name = title.trim();
        const date = parseDateFields(day, month, year);
        if (!name) {
            Alert.alert('Name required', 'Give this countdown a name.');
            return;
        }
        if (!date) {
            Alert.alert('Invalid date', 'Enter a real day, month, and year.');
            return;
        }
        persist([
            {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                title: name,
                targetAt: date.getTime(),
            },
            ...events,
        ]);
        setTitle('');
        setDay('');
        setMonth('');
        setYear('');
    };

    const removeEvent = (item: EventItem) => {
        Alert.alert('Delete countdown?', item.title, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => persist(events.filter(e => e.id !== item.id)),
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.gradient}>
                <KeyboardAvoidingView
                    style={styles.mainContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View
                        style={[
                            styles.mainContainer,
                            {
                                paddingTop:
                                    Math.max(
                                        insets.top,
                                        Platform.OS === 'android'
                                            ? StatusBar.currentHeight || 0
                                            : 0,
                                    ) + SPACING.md,
                            },
                        ]}>
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}>
                                <Text style={styles.backText}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.title}>Countdown</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <View style={styles.addCard}>
                            <Text style={styles.label}>Event name</Text>
                            <TextInput
                                style={styles.nameInput}
                                placeholder="Exam, trip, birthday..."
                                placeholderTextColor={COLORS.textMuted}
                                value={title}
                                onChangeText={setTitle}
                            />
                            <View style={styles.dateRow}>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="DD"
                                    placeholderTextColor={COLORS.textMuted}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    value={day}
                                    onChangeText={t => setDay(t.replace(/[^0-9]/g, ''))}
                                />
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="MM"
                                    placeholderTextColor={COLORS.textMuted}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    value={month}
                                    onChangeText={t => setMonth(t.replace(/[^0-9]/g, ''))}
                                />
                                <TextInput
                                    style={[styles.dateInput, styles.yearInput]}
                                    placeholder="YYYY"
                                    placeholderTextColor={COLORS.textMuted}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    value={year}
                                    onChangeText={t => setYear(t.replace(/[^0-9]/g, ''))}
                                />
                            </View>
                            <TouchableOpacity style={styles.addButton} onPress={addEvent}>
                                <Text style={styles.addButtonText}>Add countdown</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={events}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{
                                paddingHorizontal: SPACING.lg,
                                paddingBottom: insets.bottom + SPACING.xl,
                            }}
                            ListEmptyComponent={
                                <Text style={styles.empty}>
                                    Add an exam, trip, or deadline to count down to it.
                                </Text>
                            }
                            renderItem={({ item }) => {
                                const left = remainingParts(item.targetAt, now);
                                return (
                                    <TouchableOpacity
                                        style={styles.eventCard}
                                        onLongPress={() => removeEvent(item)}>
                                        <Text style={styles.eventTitle}>{item.title}</Text>
                                        {left ? (
                                            <Text style={styles.eventTime}>
                                                {left.days}d {left.hours}h {left.minutes}m{' '}
                                                {left.seconds}s
                                            </Text>
                                        ) : (
                                            <Text style={styles.eventEnded}>Ended</Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </KeyboardAvoidingView>
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
    addCard: {
        margin: SPACING.lg,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    label: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    nameInput: {
        color: COLORS.text,
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        padding: 0,
        marginBottom: SPACING.md,
    },
    dateRow: { flexDirection: 'row', gap: SPACING.sm },
    dateInput: {
        flex: 1,
        textAlign: 'center',
        backgroundColor: COLORS.backgroundLight,
        borderRadius: SIZES.radiusSm,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
        fontWeight: '700',
        paddingVertical: SPACING.sm,
        fontSize: SIZES.fontLg,
    },
    yearInput: { flex: 1.3 },
    addButton: {
        marginTop: SPACING.md,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusSm,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
    },
    addButtonText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.fontMd },
    empty: {
        textAlign: 'center',
        color: COLORS.textMuted,
        marginTop: SPACING.md,
        fontSize: SIZES.fontMd,
    },
    eventCard: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    eventTitle: { color: COLORS.text, fontSize: SIZES.fontLg, fontWeight: '700' },
    eventTime: {
        marginTop: 6,
        color: COLORS.primaryLight,
        fontSize: SIZES.fontXl,
        fontWeight: '800',
    },
    eventEnded: { marginTop: 6, color: COLORS.textMuted, fontWeight: '700' },
});
