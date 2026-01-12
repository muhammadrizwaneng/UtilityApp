import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    PermissionsAndroid,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import LinearGradient from 'react-native-linear-gradient';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import Share from 'react-native-share';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'QRGenerator'>;

interface Props {
    navigation: NavigationProp;
}

export default function QRGeneratorScreen({ navigation }: Props) {
    const [text, setText] = useState('');
    const [qrValue, setQrValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const qrRef = useRef<any>(null);
    const insets = useSafeAreaInsets();

    const requestLegacyStorageWritePermission = async () => {
        if (Platform.OS !== 'android') return true;
        const apiLevel = Number(Platform.Version);
        if (Number.isNaN(apiLevel) || apiLevel >= 29) {
            return true;
        }

        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
                title: 'Storage Permission',
                message: 'App needs storage access to save the QR image to Downloads.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
    };

    const getQrPngBase64 = () => {
        return new Promise<string>((resolve, reject) => {
            if (!qrRef.current || typeof qrRef.current.toDataURL !== 'function') {
                reject(new Error('QR ref not ready'));
                return;
            }

            qrRef.current.toDataURL((data: string) => {
                if (!data) {
                    reject(new Error('Empty QR data'));
                    return;
                }
                resolve(data);
            });
        });
    };

    const shareFile = async (filePath: string, mimeType: string) => {
        const url = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
        await Share.open({
            url,
            type: mimeType,
            failOnCancel: false,
        });
    };

    const saveQrImage = async (format: 'png' | 'jpg') => {
        if (!qrValue) {
            Alert.alert('No QR', 'Generate a QR code first');
            return;
        }

        setIsSaving(true);
        try {
            const hasPermission = await requestLegacyStorageWritePermission();
            if (!hasPermission) {
                Alert.alert('Permission Required', 'Storage permission is required to save to Downloads on older Android versions.');
                return;
            }

            const base64Png = await getQrPngBase64();
            const baseName = `qr_${Date.now()}`;
            const tempPngPath = `${RNFS.CachesDirectoryPath}/${baseName}.png`;
            await RNFS.writeFile(tempPngPath, base64Png, 'base64');

            let finalPath = tempPngPath;
            let mimeType = 'image/png';

            if (format === 'jpg') {
                const resized = await ImageResizer.createResizedImage(
                    `file://${tempPngPath}`,
                    512,
                    512,
                    'JPEG',
                    100,
                    0,
                );
                finalPath = resized.uri.startsWith('file://') ? resized.uri.replace('file://', '') : resized.uri;
                mimeType = 'image/jpeg';
            }

            if (Platform.OS === 'android') {
                const destPath = `${RNFS.DownloadDirectoryPath}/${baseName}.${format}`;
                try {
                    await RNFS.copyFile(finalPath, destPath);
                    Alert.alert('Saved', `QR saved to Downloads as ${baseName}.${format}`);
                } catch (e) {
                    console.warn('Save to Downloads failed:', e);
                    Alert.alert(
                        'Save Failed',
                        'Could not save directly to Downloads due to Android storage restrictions. Use Share to save the image via the system dialog.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Share',
                                onPress: async () => {
                                    await shareFile(finalPath, mimeType);
                                },
                            },
                        ],
                    );
                }
            } else {
                await Share.open({
                    url: `file://${finalPath}`,
                    type: mimeType,
                    saveToFiles: true,
                    failOnCancel: false,
                });
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to save QR image');
        } finally {
            setIsSaving(false);
        }
    };

    const generateQR = () => {
        if (!text.trim()) {
            Alert.alert('Empty Input', 'Please enter some text or URL');
            return;
        }
        setQrValue(text);
    };

    const clearQR = () => {
        setText('');
        setQrValue('');
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
                        <Text style={styles.title}>QR Generator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                    >
                        {/* Instructions */}
                        <View style={styles.instructionCard}>
                            <Text style={styles.instructionText}>
                                ✍️ Enter text, URL, or any data
                            </Text>
                            <Text style={styles.instructionText}>
                                🔲 Generate your QR code
                            </Text>
                            <Text style={styles.instructionText}>
                                💾 Save or share the QR code
                            </Text>
                        </View>

                        {/* Input Section */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Enter Text or URL</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://example.com or any text..."
                                placeholderTextColor={COLORS.textMuted}
                                value={text}
                                onChangeText={setText}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        {/* QR Code Display */}
                        {qrValue ? (
                            <View style={styles.qrContainer}>
                                <View style={styles.qrWrapper}>
                                    <QRCode
                                        value={qrValue}
                                        size={250}
                                        backgroundColor="white"
                                        color="black"
                                        getRef={(c: any) => (qrRef.current = c)}
                                    />
                                </View>
                                <Text style={styles.qrText} numberOfLines={2}>
                                    {qrValue}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>🔲</Text>
                                <Text style={styles.emptyText}>No QR Code Generated</Text>
                                <Text style={styles.emptySubtext}>
                                    Enter text above and tap Generate
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.generateButton}
                            onPress={generateQR}>
                            <LinearGradient
                                colors={['#EC4899', '#F472B6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}>
                                <Text style={styles.buttonText}>Generate QR Code</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {qrValue && (
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => saveQrImage('png')}
                                disabled={isSaving}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#34D399']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}>
                                    <Text style={styles.buttonText}>
                                        {isSaving ? 'Saving...' : 'Save PNG'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {qrValue && (
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => saveQrImage('jpg')}
                                disabled={isSaving}
                            >
                                <LinearGradient
                                    colors={['#3B82F6', '#60A5FA']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}>
                                    <Text style={styles.buttonText}>
                                        {isSaving ? 'Saving...' : 'Save JPG'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {qrValue && (
                            <TouchableOpacity style={styles.clearButton} onPress={clearQR}>
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
                        )}
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
    instructionCard: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        marginTop: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    instructionText: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
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
        minHeight: 100,
        textAlignVertical: 'top',
    },
    qrContainer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    qrWrapper: {
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: SIZES.radiusLg,
        ...SHADOWS.large,
    },
    qrText: {
        marginTop: SPACING.lg,
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: SPACING.lg,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl * 2,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: SPACING.lg,
    },
    emptyText: {
        fontSize: SIZES.fontXl,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    emptySubtext: {
        fontSize: SIZES.fontMd,
        color: COLORS.textMuted,
    },
    buttonContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
        gap: SPACING.md,
    },
    generateButton: {
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    saveButton: {
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
