import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    Platform,
    PermissionsAndroid,
    StatusBar,
} from 'react-native';
import {
    launchImageLibrary,
    type Asset,
    type ImagePickerResponse,
} from 'react-native-image-picker';
import ImageResizer, { type Response as ResizedImage } from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ImageCompressor'>;

interface Props {
    navigation: NavigationProp;
}

type CompressedImage = ResizedImage & {
    size: number;
    fileSize: number;
};

const QUALITY_OPTIONS = [
    { label: 'Low', value: 40 },
    { label: 'Medium', value: 60 },
    { label: 'High', value: 80 },
    { label: 'Best', value: 90 },
];

const MAX_SIZE_OPTIONS = [
    { label: 'Small', value: 800 },
    { label: 'Medium', value: 1280 },
    { label: 'Large', value: 1920 },
    { label: 'Original', value: 0 },
];

function toFileUri(pathOrUri: string) {
    if (!pathOrUri) return pathOrUri;
    return pathOrUri.startsWith('file://') ? pathOrUri : `file://${pathOrUri}`;
}

function toFsPath(pathOrUri: string) {
    return pathOrUri.startsWith('file://') ? pathOrUri.replace('file://', '') : pathOrUri;
}

function getErrorMessage(err: unknown) {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err && 'message' in err) {
        const message = (err as { message?: unknown }).message;
        return typeof message === 'string' ? message : '';
    }
    return '';
}

export default function ImageCompressorScreen({ navigation }: Props) {
    const [originalImage, setOriginalImage] = useState<Asset | null>(null);
    const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [quality, setQuality] = useState(80);
    const [maxSize, setMaxSize] = useState(1280);
    const insets = useSafeAreaInsets();

    /** Legacy WRITE_EXTERNAL_STORAGE only matters on Android < 10. Newer Android uses MediaStore (no dialog). */
    const requestLegacyStorageWritePermission = async () => {
        if (Platform.OS !== 'android') return true;
        const apiLevel = Number(Platform.Version);
        if (Number.isNaN(apiLevel) || apiLevel >= 29) return true;

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission',
                    message: 'App needs access to your storage to save compressed images.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const pickImage = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 1,
            },
            (response: ImagePickerResponse) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    Alert.alert('Error', response.errorMessage || 'Failed to pick image');
                    return;
                }
                if (response.assets && response.assets.length > 0) {
                    setOriginalImage(response.assets[0]);
                    setCompressedImage(null);
                }
            },
        );
    };

    const compressImage = async () => {
        if (!originalImage?.uri) return;

        setIsCompressing(true);
        try {
            const origW = originalImage.width || 1920;
            const origH = originalImage.height || 1080;
            let targetW = origW;
            let targetH = origH;

            if (maxSize > 0 && (origW > maxSize || origH > maxSize)) {
                if (origW >= origH) {
                    targetW = maxSize;
                    targetH = Math.round((origH / origW) * maxSize);
                } else {
                    targetH = maxSize;
                    targetW = Math.round((origW / origH) * maxSize);
                }
            }

            const result = await ImageResizer.createResizedImage(
                originalImage.uri,
                targetW,
                targetH,
                'JPEG',
                quality,
                0,
                undefined,
                false,
                { mode: 'contain', onlyScaleDown: true },
            );

            const compressedStats = await RNFS.stat(result.uri);

            setCompressedImage({
                ...result,
                size: compressedStats.size,
                fileSize: compressedStats.size,
            });
        } catch (err) {
            console.error('Compression error:', err);
            Alert.alert('Error', 'Failed to compress image. Please try with a different image.');
        } finally {
            setIsCompressing(false);
        }
    };

    const saveImage = async () => {
        if (!compressedImage?.uri || isSaving) return;

        setIsSaving(true);
        try {
            const hasPermission = await requestLegacyStorageWritePermission();
            if (!hasPermission) {
                Alert.alert('Permission Denied', 'Cannot save image without storage permission.');
                return;
            }

            const sourceUri = toFileUri(compressedImage.uri);
            const sourcePath = toFsPath(compressedImage.uri);
            const fileName = `compressed_${Date.now()}.jpg`;

            // MediaStore insert → shows in Gallery / Photos (Downloads alone often does not).
            await CameraRoll.saveAsset(sourceUri, { type: 'photo' });

            // Also keep a copy in Downloads + media-scan so Files apps can find it.
            if (Platform.OS === 'android' && RNFS.DownloadDirectoryPath) {
                try {
                    const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
                    await RNFS.copyFile(sourcePath, destPath);
                    await RNFS.scanFile(destPath);
                } catch (downloadErr) {
                    console.warn('Downloads copy failed (gallery save succeeded):', downloadErr);
                }
            }

            Alert.alert(
                'Success',
                Platform.OS === 'android'
                    ? `Image saved to Gallery (and Downloads as ${fileName}).`
                    : 'Image saved to Photos.',
            );
        } catch (err: unknown) {
            if (getErrorMessage(err) === 'User did not share') return;
            console.error(err);
            Alert.alert(
                'Error',
                'Failed to save to Gallery. You can still use Share to save the image.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Share',
                        onPress: () => {
                            void shareImage();
                        },
                    },
                ],
            );
        } finally {
            setIsSaving(false);
        }
    };

    const shareImage = async () => {
        if (!compressedImage?.uri) return;
        try {
            await Share.open({
                url: compressedImage.uri,
                type: 'image/jpeg',
            });
        } catch (err: unknown) {
            if (getErrorMessage(err) === 'User did not share') return;
            Alert.alert('Error', 'Failed to share image');
        }
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const originalFileSize = originalImage?.fileSize ?? 0;

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
                        <Text style={styles.title}>Compress Image</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}>
                        <View style={styles.previewContainer}>
                            {!originalImage ? (
                                <TouchableOpacity style={styles.pickPlaceholder} onPress={pickImage}>
                                    <Text style={styles.pickIcon}>📸</Text>
                                    <Text style={styles.pickText}>Select Image to Compress</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.comparisonContainer}>
                                    <View style={styles.imageBox}>
                                        <Text style={styles.imageLabel}>Original</Text>
                                        <Image
                                            source={{ uri: originalImage.uri ?? undefined }}
                                            style={styles.previewImage}
                                        />
                                        <Text style={styles.sizeText}>
                                            {formatSize(originalFileSize)}
                                        </Text>
                                    </View>

                                    {compressedImage && (
                                        <View style={styles.imageBox}>
                                            <Text style={styles.imageLabel}>Compressed</Text>
                                            <Image
                                                source={{ uri: compressedImage.uri }}
                                                style={styles.previewImage}
                                            />
                                            <Text style={styles.sizeText}>
                                                {formatSize(compressedImage.size)}
                                            </Text>
                                            {originalFileSize > 0 && (
                                                <Text style={styles.reductionText}>
                                                    -
                                                    {Math.max(
                                                        0,
                                                        Math.round(
                                                            (1 -
                                                                compressedImage.size /
                                                                    originalFileSize) *
                                                                100,
                                                        ),
                                                    )}
                                                    %
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        {originalImage && (
                            <>
                                <Text style={styles.sectionTitle}>Quality</Text>
                                <View style={styles.optionRow}>
                                    {QUALITY_OPTIONS.map(opt => (
                                        <TouchableOpacity
                                            key={opt.value}
                                            style={[
                                                styles.optionChip,
                                                quality === opt.value && styles.optionChipActive,
                                            ]}
                                            onPress={() => {
                                                setQuality(opt.value);
                                                setCompressedImage(null);
                                            }}>
                                            <Text
                                                style={[
                                                    styles.optionChipText,
                                                    quality === opt.value &&
                                                        styles.optionChipTextActive,
                                                ]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.sectionTitle}>Max Dimension</Text>
                                <View style={styles.optionRow}>
                                    {MAX_SIZE_OPTIONS.map(opt => (
                                        <TouchableOpacity
                                            key={opt.label}
                                            style={[
                                                styles.optionChip,
                                                maxSize === opt.value && styles.optionChipActive,
                                            ]}
                                            onPress={() => {
                                                setMaxSize(opt.value);
                                                setCompressedImage(null);
                                            }}>
                                            <Text
                                                style={[
                                                    styles.optionChipText,
                                                    maxSize === opt.value &&
                                                        styles.optionChipTextActive,
                                                ]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.actionContainer}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.pickAgainButton]}
                                        onPress={pickImage}>
                                        <Text style={styles.pickAgainText}>Pick Another</Text>
                                    </TouchableOpacity>

                                    {!compressedImage ? (
                                        <TouchableOpacity
                                            style={styles.compressButton}
                                            onPress={compressImage}
                                            disabled={isCompressing}>
                                            <LinearGradient
                                                colors={['#8B5CF6', '#A78BFA']}
                                                style={styles.buttonGradient}>
                                                <Text style={styles.buttonText}>
                                                    {isCompressing
                                                        ? 'Compressing...'
                                                        : 'Compress Now'}
                                                </Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    ) : (
                                        <>
                                            <TouchableOpacity
                                                style={styles.saveButton}
                                                onPress={saveImage}
                                                disabled={isSaving}>
                                                <LinearGradient
                                                    colors={['#10B981', '#34D399']}
                                                    style={styles.buttonGradient}>
                                                    <Text style={styles.buttonText}>
                                                        {isSaving
                                                            ? 'Saving…'
                                                            : Platform.OS === 'android'
                                                              ? 'Save to Gallery'
                                                              : 'Save to Photos'}
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionButton, styles.pickAgainButton]}
                                                onPress={shareImage}>
                                                <Text style={styles.pickAgainText}>Share</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.compressButton}
                                                onPress={compressImage}
                                                disabled={isCompressing}>
                                                <LinearGradient
                                                    colors={['#8B5CF6', '#A78BFA']}
                                                    style={styles.buttonGradient}>
                                                    <Text style={styles.buttonText}>
                                                        Re-compress
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
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
    previewContainer: {
        marginTop: SPACING.xl,
        alignItems: 'center',
    },
    pickPlaceholder: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusLg,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickIcon: {
        fontSize: 60,
        marginBottom: SPACING.md,
    },
    pickText: {
        fontSize: SIZES.fontLg,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    comparisonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    imageBox: {
        width: '48%',
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.sm,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    imageLabel: {
        fontSize: SIZES.fontSm,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    previewImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: SIZES.radiusSm,
    },
    sizeText: {
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: SPACING.sm,
    },
    reductionText: {
        fontSize: SIZES.fontSm,
        fontWeight: '700',
        color: '#10B981',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: SPACING.xl,
        marginBottom: SPACING.sm,
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    optionChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.backgroundCard,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    optionChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    optionChipText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    optionChipTextActive: {
        color: COLORS.white,
    },
    actionContainer: {
        marginTop: SPACING.xl,
        gap: SPACING.md,
    },
    actionButton: {
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
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
    pickAgainButton: {
        backgroundColor: COLORS.backgroundCard,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderRadius: SIZES.radiusMd,
    },
    pickAgainText: {
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    compressButton: {
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    saveButton: {
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
});
