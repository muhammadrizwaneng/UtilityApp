import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    ScrollView,
    Platform,
    PermissionsAndroid,
    StatusBar,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import RNFS from 'react-native-fs';
import { createPdf } from 'react-native-images-to-pdf';
import Share from 'react-native-share';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ImageToPdf'>;

interface Props {
    navigation: NavigationProp;
}

export default function ImageToPdfScreen({ navigation }: Props) {
    const [selectedImages, setSelectedImages] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const insets = useSafeAreaInsets();

    const toFileUri = (pathOrUri?: string) => {
        if (!pathOrUri) return '';
        if (pathOrUri.startsWith('file://')) return pathOrUri;
        if (pathOrUri.startsWith('/')) return `file://${pathOrUri}`;
        return pathOrUri;
    };

    const stripFileUri = (pathOrUri: string) => {
        return pathOrUri.startsWith('file://') ? pathOrUri.replace('file://', '') : pathOrUri;
    };

    const requestLegacyStorageWritePermission = async () => {
        if (Platform.OS !== 'android') return true;
        const apiLevel = Number(Platform.Version);
        if (Number.isNaN(apiLevel) || apiLevel >= 29) {
            return true;
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission',
                    message: 'App needs storage access to save PDFs to Downloads.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const sharePdf = async (pdfPath: string) => {
        const shareUrl = pdfPath.startsWith('file://') ? pdfPath : `file://${pdfPath}`;
        await Share.open({
            url: shareUrl,
            type: 'application/pdf',
            failOnCancel: false,
        });
    };

    const pickImages = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                selectionLimit: 0, // 0 means unlimited
                quality: 1,
                includeBase64: true,
            },
            (response) => {
                if (response.didCancel) {
                    return;
                }
                if (response.errorCode) {
                    Alert.alert('Error', response.errorMessage);
                    return;
                }
                if (response.assets) {
                    setSelectedImages([...selectedImages, ...response.assets]);
                }
            },
        );
    };

    const removeImage = (index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        setSelectedImages(newImages);
    };

    const generatePDF = async () => {
        if (selectedImages.length === 0) {
            Alert.alert('No Images', 'Please select at least one image');
            return;
        }

        setIsGenerating(true);
        try {
            if (typeof createPdf !== 'function') {
                Alert.alert('Error', 'PDF generator is not available. Please rebuild the app.');
                return;
            }

            const pages = selectedImages.map(img => {
                if (img?.base64) {
                    const mime = img?.type || 'image/jpeg';
                    return { imagePath: `data:${mime};base64,${img.base64}` };
                }

                const uri = toFileUri(img?.uri);
                return { imagePath: uri };
            });

            const options = {
                pages,
                outputPath: `file://${RNFS.CachesDirectoryPath}/temp_${Date.now()}.pdf`,
            };

            const pdfPath = await createPdf(options);
            const pdfFsPath = stripFileUri(pdfPath);

            if (Platform.OS === 'android') {
                const fileName = `document_${Date.now()}.pdf`;
                const apiLevel = Number(Platform.Version);
                if (!Number.isNaN(apiLevel) && apiLevel >= 29) {
                    Alert.alert(
                        'Save PDF',
                        'Android storage restrictions prevent saving directly to Downloads. Use Share to save the PDF via the system dialog.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Share',
                                onPress: async () => {
                                    await sharePdf(pdfPath);
                                },
                            },
                        ],
                    );
                    return;
                }
                const hasLegacyPermission = await requestLegacyStorageWritePermission();

                if (!hasLegacyPermission) {
                    Alert.alert(
                        'Permission Required',
                        'Storage permission is required to save directly to Downloads on older Android versions. You can still save using Share.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Share',
                                onPress: async () => {
                                    await sharePdf(pdfPath);
                                },
                            },
                        ],
                    );
                    return;
                }

                const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
                try {
                    await RNFS.copyFile(pdfFsPath, destPath);
                    Alert.alert('Success', `PDF saved to Downloads: ${fileName}`);
                } catch (saveErr) {
                    console.warn('Save to Downloads failed:', saveErr);
                    Alert.alert(
                        'Save Failed',
                        'Could not save directly to Downloads (Android storage restrictions). Use Share to save the PDF via the system dialog.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Share',
                                onPress: async () => {
                                    await sharePdf(pdfPath);
                                },
                            },
                        ],
                    );
                }
            } else {
                // iOS: Use share sheet
                await Share.open({
                    url: toFileUri(pdfPath),
                    type: 'application/pdf',
                    saveToFiles: true,
                });
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to generate PDF');
        } finally {
            setIsGenerating(false);
        }
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
                        <Text style={styles.title}>Image to PDF</Text>
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
                                📸 Select images from your gallery
                            </Text>
                            <Text style={styles.instructionText}>
                                🔄 Reorder them as needed
                            </Text>
                            <Text style={styles.instructionText}>
                                📄 Generate your PDF document
                            </Text>
                        </View>

                        {/* Selected Images */}
                        {selectedImages.length > 0 && (
                            <View style={styles.imagesContainer}>
                                <Text style={styles.sectionTitle}>
                                    Selected Images ({selectedImages.length})
                                </Text>
                                <FlatList
                                    data={selectedImages}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(_, index) => index.toString()}
                                    renderItem={({ item, index }) => (
                                        <View style={styles.imageCard}>
                                            <Image
                                                source={{ uri: item.uri }}
                                                style={styles.image}
                                                resizeMode="cover"
                                            />
                                            <TouchableOpacity
                                                style={styles.removeButton}
                                                onPress={() => removeImage(index)}>
                                                <Text style={styles.removeText}>×</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </View>
                        )}

                        {/* Empty State */}
                        {selectedImages.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>📄</Text>
                                <Text style={styles.emptyText}>No images selected</Text>
                                <Text style={styles.emptySubtext}>
                                    Tap the button below to add images
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={pickImages}>
                            <LinearGradient
                                colors={['#6366F1', '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}>
                                <Text style={styles.buttonText}>
                                    {selectedImages.length > 0 ? 'Add More Images' : 'Select Images'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {selectedImages.length > 0 && (
                            <TouchableOpacity
                                style={styles.generateButton}
                                onPress={generatePDF}>
                                <LinearGradient
                                    colors={['#EC4899', '#F472B6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}>
                                    <Text style={styles.buttonText}>
                                        {isGenerating ? 'Generating...' : 'Generate PDF'}
                                    </Text>
                                </LinearGradient>
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
    imagesContainer: {
        marginTop: SPACING.xl,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    imageCard: {
        marginRight: SPACING.md,
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    image: {
        width: 120,
        height: 160,
        borderRadius: SIZES.radiusMd,
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.error,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeText: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '700',
    },
    emptyState: {
        flex: 1,
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
    selectButton: {
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    generateButton: {
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
