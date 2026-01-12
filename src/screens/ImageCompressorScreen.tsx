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
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ImageCompressor'>;

interface Props {
    navigation: NavigationProp;
}

export default function ImageCompressorScreen({ navigation }: Props) {
    const [originalImage, setOriginalImage] = useState<any>(null);
    const [compressedImage, setCompressedImage] = useState<any>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const insets = useSafeAreaInsets();

    const requestStoragePermission = async () => {
        if (Platform.OS !== 'android') return true;

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission',
                    message: 'App needs access to your storage to save compressed images.',
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

    const pickImage = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 1,
            },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    Alert.alert('Error', response.errorMessage);
                    return;
                }
                if (response.assets && response.assets.length > 0) {
                    setOriginalImage(response.assets[0]);
                    setCompressedImage(null);
                }
            }
        );
    };

    const compressImage = async () => {
        if (!originalImage) return;

        setIsCompressing(true);
        try {
            // Get image dimensions first
            const imageInfo = await RNFS.stat(originalImage.uri);
            
            // Create compressed image with better quality settings
            const result = await ImageResizer.createResizedImage(
                originalImage.uri,
                originalImage.width || 800, // Max width
                originalImage.height || 600, // Max height
                'JPEG',
                80, // Quality (0-100)
                0, // Rotation
                undefined, // Output path (auto-generated)
                false // keep aspect ratio
            );

            // Get file size of compressed image
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
        if (!compressedImage) return;

        try {
            if (Platform.OS === 'android') {
                const hasPermission = await requestStoragePermission();
                if (!hasPermission) {
                    Alert.alert('Permission Denied', 'Cannot save image without storage permission.');
                    return;
                }

                const fileName = `compressed_${Date.now()}.jpg`;
                const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

                await RNFS.copyFile(compressedImage.uri, destPath);
                Alert.alert('Success', `Image saved to Downloads: ${fileName}`);
            } else {
                // iOS: Use share sheet
                await Share.open({
                    url: compressedImage.uri,
                    type: 'image/jpeg',
                    saveToFiles: true,
                });
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to save image');
        }
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.gradient}>
                <View style={[styles.mainContainer, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + SPACING.md }]}>
            
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}>
                            <Text style={styles.backText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Compress Image</Text>
                        <View style={styles.placeholder} />
                    </View>
                     <Text style={{ color: COLORS.text, fontSize: 16, textAlign: 'center' }}>This Feature come soon</Text>
{/*                     
                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
                    >
          
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
                                        <Image source={{ uri: originalImage.uri }} style={styles.previewImage} />
                                        <Text style={styles.sizeText}>{formatSize(originalImage.fileSize)}</Text>
                                    </View>

                                    {compressedImage && (
                                        <View style={styles.imageBox}>
                                            <Text style={styles.imageLabel}>Compressed</Text>
                                            <Image source={{ uri: compressedImage.uri }} style={styles.previewImage} />
                                            <Text style={styles.sizeText}>{formatSize(compressedImage.size)}</Text>
                                            <Text style={styles.reductionText}>
                                                -{Math.round((1 - compressedImage.size / originalImage.fileSize) * 100)}%
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

         
                        {originalImage && (
                            <View style={styles.actionContainer}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.pickAgainButton]}
                                    onPress={pickImage}
                                >
                                    <Text style={styles.pickAgainText}>Pick Another</Text>
                                </TouchableOpacity>

                                {!compressedImage ? (
                                    <TouchableOpacity
                                        style={styles.compressButton}
                                        onPress={compressImage}
                                        disabled={isCompressing}
                                    >
                                        <LinearGradient
                                            colors={['#8B5CF6', '#A78BFA']}
                                            style={styles.buttonGradient}
                                        >
                                            <Text style={styles.buttonText}>
                                                {isCompressing ? 'Compressing...' : 'Compress Now'}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={saveImage}
                                    >
                                        <LinearGradient
                                            colors={['#10B981', '#34D399']}
                                            style={styles.buttonGradient}
                                        >
                                            <Text style={styles.buttonText}>Save to Downloads</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </ScrollView> */}
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
