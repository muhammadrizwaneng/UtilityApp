import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Stopwatch'>;

interface Props {
    navigation: NavigationProp;
}

type Mode = 'stopwatch' | 'timer';

function formatMs(ms: number) {
    const totalSec = Math.floor(Math.abs(ms) / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const cs = Math.floor((Math.abs(ms) % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

export default function StopwatchScreen({ navigation }: Props) {
    const [mode, setMode] = useState<Mode>('stopwatch');
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [laps, setLaps] = useState<number[]>([]);
    const [timerMinutes, setTimerMinutes] = useState('5');
    const [timerSeconds, setTimerSeconds] = useState('0');
    const [remaining, setRemaining] = useState(0);
    const startRef = useRef<number | null>(null);
    const baseRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const clearTick = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startStopwatch = () => {
        startRef.current = Date.now();
        setRunning(true);
        clearTick();
        intervalRef.current = setInterval(() => {
            if (startRef.current != null) {
                setElapsed(baseRef.current + (Date.now() - startRef.current));
            }
        }, 50);
    };

    const pauseStopwatch = () => {
        if (startRef.current != null) {
            baseRef.current += Date.now() - startRef.current;
            setElapsed(baseRef.current);
        }
        startRef.current = null;
        setRunning(false);
        clearTick();
    };

    const resetStopwatch = () => {
        clearTick();
        startRef.current = null;
        baseRef.current = 0;
        setElapsed(0);
        setLaps([]);
        setRunning(false);
    };

    const lap = () => {
        setLaps(prev => [elapsed, ...prev]);
    };

    const startTimer = () => {
        const mins = parseInt(timerMinutes, 10) || 0;
        const secs = parseInt(timerSeconds, 10) || 0;
        const total = (mins * 60 + secs) * 1000;
        if (total <= 0) {
            Alert.alert('Invalid time', 'Set a timer greater than 0.');
            return;
        }
        setRemaining(total);
        startRef.current = Date.now();
        baseRef.current = total;
        setRunning(true);
        clearTick();
        intervalRef.current = setInterval(() => {
            if (startRef.current == null) return;
            const left = baseRef.current - (Date.now() - startRef.current);
            if (left <= 0) {
                setRemaining(0);
                setRunning(false);
                clearTick();
                startRef.current = null;
                Alert.alert('Time’s up!', 'Your timer has finished.');
                return;
            }
            setRemaining(left);
        }, 50);
    };

    const pauseTimer = () => {
        if (startRef.current != null) {
            const left = baseRef.current - (Date.now() - startRef.current);
            baseRef.current = Math.max(0, left);
            setRemaining(baseRef.current);
        }
        startRef.current = null;
        setRunning(false);
        clearTick();
    };

    const resetTimer = () => {
        clearTick();
        startRef.current = null;
        setRunning(false);
        const mins = parseInt(timerMinutes, 10) || 0;
        const secs = parseInt(timerSeconds, 10) || 0;
        const total = (mins * 60 + secs) * 1000;
        baseRef.current = total;
        setRemaining(total);
    };

    const switchMode = (next: Mode) => {
        clearTick();
        setRunning(false);
        startRef.current = null;
        setMode(next);
        if (next === 'stopwatch') {
            baseRef.current = 0;
            setElapsed(0);
            setLaps([]);
        } else {
            const mins = parseInt(timerMinutes, 10) || 0;
            const secs = parseInt(timerSeconds, 10) || 0;
            const total = (mins * 60 + secs) * 1000;
            baseRef.current = total;
            setRemaining(total);
        }
    };

    const display = mode === 'stopwatch' ? formatMs(elapsed) : formatMs(remaining);

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
                        <Text style={styles.title}>Stopwatch</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, mode === 'stopwatch' && styles.activeTab]}
                                onPress={() => switchMode('stopwatch')}>
                                <Text
                                    style={[
                                        styles.tabText,
                                        mode === 'stopwatch' && styles.activeTabText,
                                    ]}>
                                    Stopwatch
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, mode === 'timer' && styles.activeTab]}
                                onPress={() => switchMode('timer')}>
                                <Text
                                    style={[
                                        styles.tabText,
                                        mode === 'timer' && styles.activeTabText,
                                    ]}>
                                    Timer
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.clock}>{display}</Text>

                        {mode === 'timer' && !running && remaining === baseRef.current && (
                            <View style={styles.timerInputs}>
                                <View style={styles.timeField}>
                                    <Text style={styles.timeLabel}>Min</Text>
                                    <TextInput
                                        style={styles.timeInput}
                                        keyboardType="number-pad"
                                        value={timerMinutes}
                                        onChangeText={t => {
                                            setTimerMinutes(t.replace(/[^0-9]/g, '').slice(0, 3));
                                        }}
                                    />
                                </View>
                                <Text style={styles.colon}>:</Text>
                                <View style={styles.timeField}>
                                    <Text style={styles.timeLabel}>Sec</Text>
                                    <TextInput
                                        style={styles.timeInput}
                                        keyboardType="number-pad"
                                        value={timerSeconds}
                                        onChangeText={t => {
                                            const v = t.replace(/[^0-9]/g, '').slice(0, 2);
                                            setTimerSeconds(v);
                                        }}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.controls}>
                            {mode === 'stopwatch' ? (
                                <>
                                    <TouchableOpacity
                                        style={styles.secondaryBtn}
                                        onPress={resetStopwatch}>
                                        <Text style={styles.secondaryBtnText}>Reset</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.primaryBtn}
                                        onPress={running ? pauseStopwatch : startStopwatch}>
                                        <Text style={styles.primaryBtnText}>
                                            {running ? 'Pause' : 'Start'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.secondaryBtn}
                                        onPress={lap}
                                        disabled={!running && elapsed === 0}>
                                        <Text style={styles.secondaryBtnText}>Lap</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={styles.secondaryBtn}
                                        onPress={resetTimer}>
                                        <Text style={styles.secondaryBtnText}>Reset</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.primaryBtn}
                                        onPress={running ? pauseTimer : startTimer}>
                                        <Text style={styles.primaryBtnText}>
                                            {running ? 'Pause' : 'Start'}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        {mode === 'stopwatch' && laps.length > 0 && (
                            <View style={styles.laps}>
                                <Text style={styles.sectionTitle}>Laps</Text>
                                {laps.map((lapMs, index) => (
                                    <View key={`${lapMs}-${index}`} style={styles.lapRow}>
                                        <Text style={styles.lapIndex}>
                                            Lap {laps.length - index}
                                        </Text>
                                        <Text style={styles.lapTime}>{formatMs(lapMs)}</Text>
                                    </View>
                                ))}
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
    tabContainer: {
        flexDirection: 'row',
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.sm,
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
    clock: {
        marginTop: SPACING.xxl,
        textAlign: 'center',
        fontSize: 48,
        fontWeight: '700',
        color: COLORS.text,
        fontVariant: ['tabular-nums'],
    },
    timerInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.lg,
        gap: SPACING.md,
    },
    timeField: {
        alignItems: 'center',
    },
    timeLabel: {
        color: COLORS.textMuted,
        marginBottom: SPACING.xs,
        fontSize: SIZES.fontSm,
    },
    timeInput: {
        width: 80,
        textAlign: 'center',
        fontSize: SIZES.font2xl,
        fontWeight: '700',
        color: COLORS.text,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusSm,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: SPACING.sm,
    },
    colon: {
        fontSize: SIZES.font2xl,
        color: COLORS.text,
        fontWeight: '700',
        marginTop: SPACING.md,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.md,
        marginTop: SPACING.xxl,
    },
    primaryBtn: {
        minWidth: 110,
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.primary,
        ...SHADOWS.medium,
    },
    primaryBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: SIZES.fontMd,
    },
    secondaryBtn: {
        minWidth: 90,
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.backgroundCard,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    secondaryBtnText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: SIZES.fontMd,
    },
    laps: {
        marginTop: SPACING.xl,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    lapRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    lapIndex: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    lapTime: {
        color: COLORS.text,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
});
