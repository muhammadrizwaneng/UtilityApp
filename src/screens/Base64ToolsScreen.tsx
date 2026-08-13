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
    Alert,
    Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Base64Tools'>;

interface Props {
    navigation: NavigationProp;
}

function encodeBase64(text: string) {
    // btoa isn't always available in RN; use a small polyfill via Buffer-less approach
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes = unescape(encodeURIComponent(text));
    let output = '';
    for (let i = 0; i < bytes.length; i += 3) {
        const a = bytes.charCodeAt(i);
        const b = i + 1 < bytes.length ? bytes.charCodeAt(i + 1) : NaN;
        const c = i + 2 < bytes.length ? bytes.charCodeAt(i + 2) : NaN;
        const bitmap = (a << 16) | ((isNaN(b) ? 0 : b) << 8) | (isNaN(c) ? 0 : c);
        output += chars.charAt((bitmap >> 18) & 63);
        output += chars.charAt((bitmap >> 12) & 63);
        output += isNaN(b) ? '=' : chars.charAt((bitmap >> 6) & 63);
        output += isNaN(c) ? '=' : chars.charAt(bitmap & 63);
    }
    return output;
}

function decodeBase64(text: string) {
    const cleaned = text.replace(/\s/g, '');
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) || cleaned.length % 4 !== 0) {
        throw new Error('Invalid Base64');
    }
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let bytes = '';
    for (let i = 0; i < cleaned.length; i += 4) {
        const enc1 = chars.indexOf(cleaned.charAt(i));
        const enc2 = chars.indexOf(cleaned.charAt(i + 1));
        const enc3 = chars.indexOf(cleaned.charAt(i + 2));
        const enc4 = chars.indexOf(cleaned.charAt(i + 3));
        const bitmap =
            (enc1 << 18) | (enc2 << 12) | ((enc3 & 63) << 6) | (enc4 & 63);
        bytes += String.fromCharCode((bitmap >> 16) & 255);
        if (cleaned.charAt(i + 2) !== '=') {
            bytes += String.fromCharCode((bitmap >> 8) & 255);
        }
        if (cleaned.charAt(i + 3) !== '=') {
            bytes += String.fromCharCode(bitmap & 255);
        }
    }
    return decodeURIComponent(escape(bytes));
}

export default function Base64ToolsScreen({ navigation }: Props) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const insets = useSafeAreaInsets();

    const encode = () => {
        try {
            setOutput(encodeBase64(input));
        } catch {
            Alert.alert('Error', 'Failed to encode text');
        }
    };

    const decode = () => {
        try {
            setOutput(decodeBase64(input));
        } catch {
            Alert.alert('Error', 'Invalid Base64 string');
        }
    };

    const swap = () => {
        setInput(output);
        setOutput(input);
    };

    const copy = () => {
        if (!output) return;
        Clipboard.setString(output);
        Alert.alert('Copied', 'Result copied to clipboard');
    };

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
                        <Text style={styles.title}>Base64 Tools</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Input</Text>
                        <TextInput
                            style={styles.input}
                            multiline
                            value={input}
                            onChangeText={setInput}
                            placeholder="Enter text or Base64..."
                            placeholderTextColor={COLORS.textMuted}
                            textAlignVertical="top"
                        />

                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.primaryBtn} onPress={encode}>
                                <Text style={styles.primaryBtnText}>Encode</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.primaryBtn} onPress={decode}>
                                <Text style={styles.primaryBtnText}>Decode</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.secondaryActions}>
                            <TouchableOpacity style={styles.secondaryBtn} onPress={swap}>
                                <Text style={styles.secondaryBtnText}>Swap ⇅</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryBtn} onPress={copy}>
                                <Text style={styles.secondaryBtnText}>Copy Result</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.secondaryBtn}
                                onPress={() => {
                                    setInput('');
                                    setOutput('');
                                }}>
                                <Text style={styles.secondaryBtnText}>Clear</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Output</Text>
                        <View style={styles.outputBox}>
                            <Text style={styles.outputText} selectable>
                                {output || 'Result appears here'}
                            </Text>
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
    label: {
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: SIZES.fontMd,
    },
    input: {
        minHeight: 120,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
        padding: SPACING.md,
        fontSize: SIZES.fontMd,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.lg,
    },
    primaryBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.primary,
        ...SHADOWS.medium,
    },
    primaryBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: SIZES.fontMd,
    },
    secondaryActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },
    secondaryBtn: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.backgroundCard,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    secondaryBtnText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    outputBox: {
        minHeight: 120,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
    },
    outputText: {
        color: COLORS.text,
        fontSize: SIZES.fontMd,
    },
});
