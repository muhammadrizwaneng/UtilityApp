import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Platform,
    StatusBar,
    ScrollView,
    Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TextTools'>;

interface Props {
    navigation: NavigationProp;
}

export default function TextToolsScreen({ navigation }: Props) {
    const [text, setText] = useState('');
    const insets = useSafeAreaInsets();

    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const charCount = text.length;
    const charCountNoSpaces = text.replace(/\s/g, '').length;

    const transformText = (type: string) => {
        let transformed = '';
        switch (type) {
            case 'uppercase':
                transformed = text.toUpperCase();
                break;
            case 'lowercase':
                transformed = text.toLowerCase();
                break;
            case 'capitalize':
                transformed = text.replace(/\b\w/g, l => l.toUpperCase());
                break;
            case 'sentence':
                transformed = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
                break;
            case 'reverse':
                transformed = text.split('').reverse().join('');
                break;
            case 'remove-spaces':
                transformed = text.replace(/\s+/g, ' ').trim();
                break;
            default:
                transformed = text;
        }
        setText(transformed);
    };

    const copyToClipboard = () => {
        Clipboard.setString(text);
        Alert.alert('Copied!', 'Text copied to clipboard');
    };

    const clearText = () => {
        setText('');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.gradient}>
                <View style={[styles.mainContainer, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + SPACING.md }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}>
                            <Text style={styles.backText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Text Tools</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                    >
                        {/* Stats Card */}
                        <View style={styles.statsCard}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{wordCount}</Text>
                                <Text style={styles.statLabel}>Words</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{charCount}</Text>
                                <Text style={styles.statLabel}>Characters</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{charCountNoSpaces}</Text>
                                <Text style={styles.statLabel}>No Spaces</Text>
                            </View>
                        </View>

                        {/* Text Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Enter Your Text</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Type or paste your text here..."
                                placeholderTextColor={COLORS.textMuted}
                                value={text}
                                onChangeText={setText}
                                multiline
                                numberOfLines={8}
                            />
                        </View>

                        {/* Transform Buttons */}
                        <View style={styles.transformSection}>
                            <Text style={styles.label}>Text Transformations</Text>
                            <View style={styles.buttonGrid}>
                                <TouchableOpacity
                                    style={styles.transformButton}
                                    onPress={() => transformText('uppercase')}>
                                    <Text style={styles.transformButtonText}>UPPERCASE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.transformButton}
                                    onPress={() => transformText('lowercase')}>
                                    <Text style={styles.transformButtonText}>lowercase</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.transformButton}
                                    onPress={() => transformText('capitalize')}>
                                    <Text style={styles.transformButtonText}>Capitalize</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.transformButton}
                                    onPress={() => transformText('sentence')}>
                                    <Text style={styles.transformButtonText}>Sentence</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.transformButton}
                                    onPress={() => transformText('reverse')}>
                                    <Text style={styles.transformButtonText}>Reverse</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.transformButton}
                                    onPress={() => transformText('remove-spaces')}>
                                    <Text style={styles.transformButtonText}>Trim</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={copyToClipboard}
                            disabled={!text}>
                            <LinearGradient
                                colors={['#8B5CF6', '#A78BFA']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}>
                                <Text style={styles.buttonText}>Copy Text</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={clearText}
                            disabled={!text}>
                            <Text style={styles.clearButtonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
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
    statsCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        marginTop: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: SIZES.font2xl,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    statLabel: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.md,
    },
    inputSection: {
        marginTop: SPACING.xl,
    },
    label: {
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    input: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.md,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        minHeight: 150,
        textAlignVertical: 'top',
    },
    transformSection: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    buttonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    transformButton: {
        backgroundColor: COLORS.backgroundCard,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: SIZES.radiusSm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    transformButtonText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    actionContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
        gap: SPACING.md,
    },
    copyButton: {
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
    clearButton: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    clearButtonText: {
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
});
