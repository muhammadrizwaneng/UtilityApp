import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
    ScrollView,
    Alert,
    Clipboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ColorPicker'>;

interface Props {
    navigation: NavigationProp;
}

const FAVORITES_KEY = '@utilityhub_color_favorites';

const PRESETS = [
    '#EF4444',
    '#F97316',
    '#F59E0B',
    '#84CC16',
    '#10B981',
    '#14B8A6',
    '#06B6D4',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#A855F7',
    '#EC4899',
    '#F43F5E',
    '#FFFFFF',
    '#94A3B8',
    '#0F172A',
];

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

function hsvToRgb(h: number, s: number, v: number) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0,
        g = 0,
        b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
}

function rgbToHex(r: number, g: number, b: number) {
    return (
        '#' +
        [r, g, b]
            .map(v => clamp(v, 0, 255).toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()
    );
}

function hexToRgb(hex: string) {
    const cleaned = hex.replace('#', '');
    if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return null;
    return {
        r: parseInt(cleaned.slice(0, 2), 16),
        g: parseInt(cleaned.slice(2, 4), 16),
        b: parseInt(cleaned.slice(4, 6), 16),
    };
}

function rgbToHsv(r: number, g: number, b: number) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === rn) h = ((gn - bn) / d) % 6;
        else if (max === gn) h = (bn - rn) / d + 2;
        else h = (rn - gn) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }
    const s = max === 0 ? 0 : d / max;
    return { h, s, v: max };
}

export default function ColorPickerScreen({ navigation }: Props) {
    const [hue, setHue] = useState(220);
    const [sat, setSat] = useState(0.7);
    const [val, setVal] = useState(0.9);
    const [hexInput, setHexInput] = useState('#4F46E5');
    const [favorites, setFavorites] = useState<string[]>([]);
    const insets = useSafeAreaInsets();

    const rgb = hsvToRgb(hue, sat, val);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    useEffect(() => {
        AsyncStorage.getItem(FAVORITES_KEY).then(raw => {
            if (raw) {
                try {
                    setFavorites(JSON.parse(raw));
                } catch {
                    /* ignore */
                }
            }
        });
    }, []);

    useEffect(() => {
        setHexInput(hex);
    }, [hex]);

    const applyHex = (value: string) => {
        setHexInput(value);
        const parsed = hexToRgb(value.startsWith('#') ? value : `#${value}`);
        if (!parsed) return;
        const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
        setHue(hsv.h);
        setSat(hsv.s);
        setVal(hsv.v);
    };

    const copyHex = () => {
        Clipboard.setString(hex);
        Alert.alert('Copied', `${hex} copied to clipboard`);
    };

    const copyRgb = () => {
        const text = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        Clipboard.setString(text);
        Alert.alert('Copied', `${text} copied to clipboard`);
    };

    const saveFavorite = async () => {
        if (favorites.includes(hex)) {
            Alert.alert('Saved', 'Color already in favorites');
            return;
        }
        const next = [hex, ...favorites].slice(0, 24);
        setFavorites(next);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    };

    const removeFavorite = async (color: string) => {
        const next = favorites.filter(c => c !== color);
        setFavorites(next);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    };

    const Stepper = ({
        label,
        value,
        display,
        onDec,
        onInc,
    }: {
        label: string;
        value: number;
        display: string;
        onDec: () => void;
        onInc: () => void;
    }) => (
        <View style={styles.stepperRow}>
            <Text style={styles.stepperLabel}>{label}</Text>
            <View style={styles.stepperControls}>
                <TouchableOpacity style={styles.stepBtn} onPress={onDec}>
                    <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{display}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={onInc}>
                    <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

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
                        <Text style={styles.title}>Color Picker</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        showsVerticalScrollIndicator={false}>
                        <View style={[styles.preview, { backgroundColor: hex }]} />

                        <View style={styles.valuesCard}>
                            <View style={styles.hexRow}>
                                <TextInput
                                    style={styles.hexInput}
                                    value={hexInput}
                                    onChangeText={applyHex}
                                    autoCapitalize="characters"
                                    maxLength={7}
                                    placeholderTextColor={COLORS.textMuted}
                                />
                                <TouchableOpacity style={styles.copyBtn} onPress={copyHex}>
                                    <Text style={styles.copyBtnText}>Copy HEX</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.rgbText}>
                                RGB({rgb.r}, {rgb.g}, {rgb.b})
                            </Text>
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.secondaryBtn} onPress={copyRgb}>
                                    <Text style={styles.secondaryBtnText}>Copy RGB</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.secondaryBtn} onPress={saveFavorite}>
                                    <Text style={styles.secondaryBtnText}>★ Favorite</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Stepper
                            label="Hue"
                            value={hue}
                            display={`${Math.round(hue)}°`}
                            onDec={() => setHue(h => (h - 5 + 360) % 360)}
                            onInc={() => setHue(h => (h + 5) % 360)}
                        />
                        <Stepper
                            label="Saturation"
                            value={sat}
                            display={`${Math.round(sat * 100)}%`}
                            onDec={() => setSat(s => clamp(+(s - 0.05).toFixed(2), 0, 1))}
                            onInc={() => setSat(s => clamp(+(s + 0.05).toFixed(2), 0, 1))}
                        />
                        <Stepper
                            label="Brightness"
                            value={val}
                            display={`${Math.round(val * 100)}%`}
                            onDec={() => setVal(v => clamp(+(v - 0.05).toFixed(2), 0, 1))}
                            onInc={() => setVal(v => clamp(+(v + 0.05).toFixed(2), 0, 1))}
                        />

                        <Text style={styles.sectionTitle}>Presets</Text>
                        <View style={styles.swatchGrid}>
                            {PRESETS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[styles.swatch, { backgroundColor: color }]}
                                    onPress={() => applyHex(color)}
                                />
                            ))}
                        </View>

                        {favorites.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Favorites</Text>
                                <View style={styles.swatchGrid}>
                                    {favorites.map(color => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[styles.swatch, { backgroundColor: color }]}
                                            onPress={() => applyHex(color)}
                                            onLongPress={() => removeFavorite(color)}
                                        />
                                    ))}
                                </View>
                                <Text style={styles.hint}>Long-press a favorite to remove</Text>
                            </>
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
    preview: {
        marginTop: SPACING.lg,
        height: 140,
        borderRadius: SIZES.radiusLg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    valuesCard: {
        marginTop: SPACING.lg,
        padding: SPACING.lg,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    hexRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        alignItems: 'center',
    },
    hexInput: {
        flex: 1,
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.text,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusSm,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    copyBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: SIZES.radiusSm,
    },
    copyBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: SIZES.fontSm,
    },
    rgbText: {
        marginTop: SPACING.md,
        color: COLORS.textSecondary,
        fontSize: SIZES.fontMd,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },
    secondaryBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.glass,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    secondaryBtnText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    stepperRow: {
        marginTop: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    stepperLabel: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: SIZES.fontMd,
    },
    stepperControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    stepBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepBtnText: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 24,
    },
    stepperValue: {
        minWidth: 64,
        textAlign: 'center',
        color: COLORS.text,
        fontWeight: '700',
        fontSize: SIZES.fontMd,
    },
    sectionTitle: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.md,
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
    },
    swatchGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    swatch: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusSm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    hint: {
        marginTop: SPACING.sm,
        color: COLORS.textMuted,
        fontSize: SIZES.fontSm,
    },
});
