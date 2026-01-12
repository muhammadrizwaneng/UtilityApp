import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
    StatusBar,
    Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
// import Clipboard from '@react-native-clipboard/clipboard';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PasswordGenerator'>;

interface Props {
    navigation: NavigationProp;
}

export default function PasswordGeneratorScreen({ navigation }: Props) {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | 'very-strong'>('medium');
    const insets = useSafeAreaInsets();

    const generatePassword = () => {
        let charset = '';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (charset === '') {
            Alert.alert('Error', 'Please select at least one character type');
            return;
        }

        let newPassword = '';
        for (let i = 0; i < length; i++) {
            newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        setPassword(newPassword);
        calculateStrength(newPassword);
    };

    const calculateStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length >= 12) strength++;
        if (pwd.length >= 16) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[^a-zA-Z\d]/.test(pwd)) strength++;

        if (strength <= 2) setPasswordStrength('weak');
        else if (strength === 3) setPasswordStrength('medium');
        else if (strength === 4) setPasswordStrength('strong');
        else setPasswordStrength('very-strong');
    };

    const copyToClipboard = () => {
        if (password) {
            Clipboard.setString(password);
            Alert.alert('Copied', 'Password copied to clipboard');
        }
    };

    useEffect(() => {
        generatePassword();
    }, []);

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 'weak': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'strong': return '#10B981';
            case 'very-strong': return '#059669';
            default: return '#6B7280';
        }
    };

    const getStrengthText = () => {
        return passwordStrength.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.gradient}>
                <View style={[styles.mainContainer, { paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0) + SPACING.md }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}>
                            <Text style={styles.backText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Password Generator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                    >
                        {/* Password Display */}
                        <View style={styles.passwordContainer}>
                            <Text style={styles.passwordText} selectable>
                                {password || 'Click generate to create password'}
                            </Text>
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={copyToClipboard}
                                disabled={!password}
                            >
                                <Text style={styles.copyButtonText}>📋</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Strength Indicator */}
                        <View style={styles.strengthContainer}>
                            <Text style={styles.strengthLabel}>Password Strength:</Text>
                            <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                                {getStrengthText()}
                            </Text>
                        </View>

                        {/* Length Slider */}
                        <View style={styles.settingContainer}>
                            <Text style={styles.settingLabel}>Length: {length}</Text>
                            <View style={styles.sliderContainer}>
                                <TouchableOpacity
                                    style={styles.sliderButton}
                                    onPress={() => setLength(Math.max(4, length - 1))}
                                >
                                    <Text style={styles.sliderButtonText}>-</Text>
                                </TouchableOpacity>
                                <View style={styles.sliderTrack}>
                                    <View 
                                        style={[
                                            styles.sliderFill, 
                                            { width: `${((length - 4) / 28) * 100}%` }
                                        ]} 
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.sliderButton}
                                    onPress={() => setLength(Math.min(32, length + 1))}
                                >
                                    <Text style={styles.sliderButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Character Options */}
                        <View style={styles.optionsContainer}>
                            <View style={styles.optionRow}>
                                <Text style={styles.optionLabel}>Uppercase (A-Z)</Text>
                                <Switch
                                    value={includeUppercase}
                                    onValueChange={setIncludeUppercase}
                                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                                    thumbColor={COLORS.white}
                                />
                            </View>

                            <View style={styles.optionRow}>
                                <Text style={styles.optionLabel}>Lowercase (a-z)</Text>
                                <Switch
                                    value={includeLowercase}
                                    onValueChange={setIncludeLowercase}
                                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                                    thumbColor={COLORS.white}
                                />
                            </View>

                            <View style={styles.optionRow}>
                                <Text style={styles.optionLabel}>Numbers (0-9)</Text>
                                <Switch
                                    value={includeNumbers}
                                    onValueChange={setIncludeNumbers}
                                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                                    thumbColor={COLORS.white}
                                />
                            </View>

                            <View style={styles.optionRow}>
                                <Text style={styles.optionLabel}>Symbols (!@#$...)</Text>
                                <Switch
                                    value={includeSymbols}
                                    onValueChange={setIncludeSymbols}
                                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                                    thumbColor={COLORS.white}
                                />
                            </View>
                        </View>

                        {/* Generate Button */}
                        <TouchableOpacity
                            style={styles.generateButton}
                            onPress={generatePassword}>
                            <LinearGradient
                                colors={['#6366F1', '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}>
                                <Text style={styles.buttonText}>Generate Password</Text>
                            </LinearGradient>
                        </TouchableOpacity>
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.md,
        marginTop: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    passwordText: {
        flex: 1,
        fontSize: SIZES.fontLg,
        color: COLORS.text,
        fontFamily: 'monospace',
        marginRight: SPACING.sm,
    },
    copyButton: {
        padding: SPACING.sm,
    },
    copyButtonText: {
        fontSize: 20,
    },
    strengthContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    strengthLabel: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
    },
    strengthText: {
        fontSize: SIZES.fontMd,
        fontWeight: '600',
    },
    settingContainer: {
        marginTop: SPACING.xl,
    },
    settingLabel: {
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    sliderButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    sliderButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.white,
    },
    sliderTrack: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    sliderFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    optionsContainer: {
        marginTop: SPACING.xl,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    optionLabel: {
        fontSize: SIZES.fontMd,
        color: COLORS.text,
    },
    generateButton: {
        marginTop: SPACING.xl,
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    buttonGradient: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        color: COLORS.white,
    },
});
