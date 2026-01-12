import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';

interface UtilityCardProps {
    title: string;
    description: string;
    icon: string;
    gradient?: string[];
    onPress: () => void;
}

export default function UtilityCard({
    title,
    description,
    icon,
    gradient,
    onPress,
}: UtilityCardProps) {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}>
            <LinearGradient
                colors={gradient || [COLORS.gradientStart, COLORS.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, { borderRadius: SIZES.radiusLg }]}>
                <View style={styles.content}>
                    <Text style={styles.icon}>{icon}</Text>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '48%',
        marginBottom: SPACING.md,
        borderRadius: SIZES.radiusLg,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    gradient: {
        padding: SPACING.lg,
        minHeight: 180,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    icon: {
        fontSize: 32,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: SIZES.fontLg,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: SPACING.xs,
        letterSpacing: 0.5,
    },
    description: {
        fontSize: SIZES.fontSm,
        color: COLORS.white,
        opacity: 0.85,
        lineHeight: 18,
    },
});
