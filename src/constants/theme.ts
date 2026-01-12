export interface ThemeColors {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    accentLight: string;
    background: string;
    backgroundLight: string;
    backgroundCard: string;
    gradientStart: string;
    gradientMiddle: string;
    gradientEnd: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    glass: string;
    glassLight: string;
    overlay: string;
    white: string;
    black: string;
}

export const COLORS: ThemeColors = {
    // Primary gradient colors
    primary: '#4F46E5', // Indigo 600
    primaryDark: '#3730A3', // Indigo 800
    primaryLight: '#818CF8', // Indigo 400

    // Accent colors
    accent: '#F43F5E', // Rose 500
    accentLight: '#FB7185', // Rose 400

    // Background colors
    background: '#0F172A', // Slate 900
    backgroundLight: '#1E293B', // Slate 800
    backgroundCard: 'rgba(30, 41, 59, 0.6)', // Semi-transparent glass

    // Gradient backgrounds
    gradientStart: '#4F46E5',
    gradientMiddle: '#7C3AED',
    gradientEnd: '#EC4899',

    // Text colors
    text: '#F8FAFC', // Slate 50
    textSecondary: '#E2E8F0', // Slate 200
    textMuted: '#94A3B8', // Slate 400

    // UI colors
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Glassmorphism
    glass: 'rgba(255, 255, 255, 0.08)',
    glassLight: 'rgba(255, 255, 255, 0.04)',

    // Overlay
    overlay: 'rgba(15, 23, 42, 0.85)',
    white: '#FFFFFF',
    black: '#000000',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const SIZES = {
    // Font sizes
    fontXs: 12,
    fontSm: 14,
    fontMd: 16,
    fontLg: 18,
    fontXl: 24,
    font2xl: 32,
    font3xl: 40,

    // Icon sizes
    iconSm: 20,
    iconMd: 24,
    iconLg: 32,
    iconXl: 48,

    // Border radius
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 24,
    radiusFull: 9999,
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
};
