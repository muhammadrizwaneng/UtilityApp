import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, StatusBar, Modal, Dimensions, Linking, Clipboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'QRScanner'>;

interface Props {
    navigation: NavigationProp;
}

export default function QRScannerScreen({ navigation }: Props) {
    const [scanned, setScanned] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [scannedData, setScannedData] = useState('');
    const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
    const insets = useSafeAreaInsets();
    const devices = useCameraDevices();
    const device = devices.find(d => d.position === 'back');
    
    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13', 'ean-8', 'aztec', 'data-matrix'],
        onCodeScanned: (codes) => {
            if (!scanned && codes.length > 0) {
                setScanned(true);
                const data = codes[0].value || '';
                setScannedData(data);
                setModalVisible(true);
            }
        },
    });

    useEffect(() => {
        checkCameraPermission();
    }, []);

    const checkCameraPermission = async () => {
        const permission = await Camera.getCameraPermissionStatus();
        setCameraPermission(permission === 'granted');
        
        if (permission !== 'granted') {
            const newPermission = await Camera.requestCameraPermission();
            setCameraPermission(newPermission === 'granted');
        }
    };

    const openCameraSettings = async () => {
        try {
            await Linking.openSettings();
        } catch (e) {
            Alert.alert('Error', 'Unable to open settings');
        }
    };

    const handleCopy = () => {
        Clipboard.setString(scannedData);
        Alert.alert('Copied', 'QR Code data copied to clipboard');
        setModalVisible(false);
        setScanned(false);
    };

    const handleOK = () => {
        setModalVisible(false);
        setScanned(false);
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
                        <Text style={styles.title}>QR Scanner</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <View style={styles.content}>
                        {cameraPermission === null ? (
                            <View style={styles.permissionContainer}>
                                <Text style={styles.permissionText}>Checking camera permission...</Text>
                            </View>
                        ) : cameraPermission === false ? (
                            <View style={styles.permissionContainer}>
                                <Text style={styles.permissionText}>Camera permission required</Text>
                                <TouchableOpacity style={styles.permissionButton} onPress={checkCameraPermission}>
                                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.permissionButton, { marginTop: SPACING.md, backgroundColor: '#6B7280' }]}
                                    onPress={openCameraSettings}
                                >
                                    <Text style={styles.permissionButtonText}>Open Settings</Text>
                                </TouchableOpacity>
                            </View>
                        ) : device == null ? (
                            <View style={styles.permissionContainer}>
                                <Text style={styles.permissionText}>No camera device available</Text>
                            </View>
                        ) : (
                            <View style={styles.cameraContainer}>
                                <Camera
                                    style={styles.camera}
                                    device={device}
                                    isActive={true}
                                    codeScanner={codeScanner}
                                    enableZoomGesture={true}
                                />
                                <View style={styles.overlay}>
                                    <View style={styles.scanTarget} />
                                    <Text style={styles.instructionText}>
                                        Center the QR code within the frame
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.bottomCard}>
                            <Text style={styles.infoTitle}>Scanning Tips</Text>
                            <Text style={styles.infoText}>
                                • Keep the phone steady{'\n'}
                                • Ensure there's enough light{'\n'}
                                • Don't get too close or too far
                            </Text>
                        </View>
                    </View>

                    {/* Result Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={handleOK}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Scan Result</Text>
                                <View style={styles.resultContainer}>
                                    <Text style={styles.resultText} selectable>
                                        {scannedData}
                                    </Text>
                                </View>
                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.copyButton]}
                                        onPress={handleCopy}
                                    >
                                        <Text style={styles.modalButtonText}>Copy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.okButton]}
                                        onPress={handleOK}
                                    >
                                        <Text style={styles.modalButtonText}>OK</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
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
    cameraContainer: {
        flex: 1,
        marginTop: SPACING.lg,
        borderRadius: SIZES.radiusLg,
        overflow: 'hidden',
        backgroundColor: COLORS.black,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scanTarget: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: SIZES.radiusLg,
        backgroundColor: 'transparent',
    },
    instructionText: {
        marginTop: SPACING.xl,
        color: COLORS.white,
        fontSize: SIZES.fontMd,
        fontWeight: '600',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: SIZES.radiusSm,
    },
    bottomCard: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    infoTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    infoText: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    permissionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
    },
    permissionText: {
        fontSize: SIZES.fontLg,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    permissionButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: SIZES.radiusMd,
        ...SHADOWS.medium,
    },
    permissionButtonText: {
        color: COLORS.white,
        fontSize: SIZES.fontLg,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusLg,
        padding: SPACING.xl,
        marginHorizontal: SPACING.xl,
        maxWidth: Dimensions.get('window').width - SPACING.xl * 2,
        ...SHADOWS.large,
    },
    modalTitle: {
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    resultContainer: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    resultText: {
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        lineHeight: 22,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    modalButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    copyButton: {
        backgroundColor: COLORS.primary,
    },
    okButton: {
        backgroundColor: '#6B7280',
    },
    modalButtonText: {
        color: COLORS.white,
        fontSize: SIZES.fontLg,
        fontWeight: '600',
    },
});
