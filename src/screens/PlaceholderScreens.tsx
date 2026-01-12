import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

interface PlaceholderProps {
    navigation: NativeStackNavigationProp<RootStackParamList, any>;
    title: string;
    icon: string;
    description: string;
}

const PlaceholderScreen: React.FC<PlaceholderProps> = ({ navigation, title, icon, description }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.gradient}>
                <View style={[styles.mainContainer, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + SPACING.md, paddingBottom: insets.bottom }]}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}>
                            <Text style={styles.backText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>{title}</Text>
                        <View style={styles.placeholder} />
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.icon}>{icon}</Text>
                        <Text style={styles.text}>{title}</Text>
                        <Text style={styles.description}>{description}</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

export const CurrencyConverterScreen: React.FC<{ navigation: NativeStackNavigationProp<RootStackParamList, 'CurrencyConverter'> }> = ({ navigation }) => (
    <PlaceholderScreen
        navigation={navigation}
        title="Currency Converter"
        icon="💱"
        description="Real-time currency conversion feature coming soon"
    />
);

export const ColorPickerScreen: React.FC<{ navigation: NativeStackNavigationProp<RootStackParamList, 'ColorPicker'> }> = ({ navigation }) => (
    <PlaceholderScreen
        navigation={navigation}
        title="Color Picker"
        icon="🎨"
        description="Extract colors from images feature coming soon"
    />
);

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
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
    },
    icon: {
        fontSize: 80,
        marginBottom: SPACING.lg,
    },
    text: {
        fontSize: SIZES.font2xl,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: SIZES.fontMd,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
});
