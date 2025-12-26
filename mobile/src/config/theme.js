// Theme configuration for light and dark modes
export const lightTheme = {
  dark: false,
  colors: {
    // Primary colors
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    
    // Background colors
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceVariant: '#F1F5F9',
    card: '#FFFFFF',
    
    // Text colors
    text: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    
    // UI colors
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    divider: '#E2E8F0',
    
    // Status colors
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    
    // Chat colors
    userBubble: '#6366F1',
    userBubbleText: '#FFFFFF',
    aiBubble: '#F1F5F9',
    aiBubbleText: '#1E293B',
    
    // Navigation
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    tabActive: '#6366F1',
    tabInactive: '#94A3B8',
    
    // Input
    inputBackground: '#F8FAFC',
    inputBorder: '#E2E8F0',
    inputText: '#1E293B',
    inputPlaceholder: '#94A3B8',
    
    // Skeleton
    skeleton: '#E2E8F0',
    skeletonHighlight: '#F8FAFC',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    modalBackground: '#FFFFFF',
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    // Primary colors
    primary: '#818CF8',
    primaryLight: '#A5B4FC',
    primaryDark: '#6366F1',
    
    // Background colors
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    card: '#1E293B',
    
    // Text colors
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    textInverse: '#0F172A',
    
    // UI colors
    border: '#334155',
    borderLight: '#475569',
    divider: '#334155',
    
    // Status colors
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    error: '#F87171',
    errorLight: '#7F1D1D',
    info: '#60A5FA',
    infoLight: '#1E3A8A',
    
    // Chat colors
    userBubble: '#6366F1',
    userBubbleText: '#FFFFFF',
    aiBubble: '#334155',
    aiBubbleText: '#F8FAFC',
    
    // Navigation
    tabBar: '#1E293B',
    tabBarBorder: '#334155',
    tabActive: '#818CF8',
    tabInactive: '#64748B',
    
    // Input
    inputBackground: '#1E293B',
    inputBorder: '#334155',
    inputText: '#F8FAFC',
    inputPlaceholder: '#64748B',
    
    // Skeleton
    skeleton: '#334155',
    skeletonHighlight: '#475569',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    modalBackground: '#1E293B',
  },
  
  // Same spacing, borderRadius, fontSize, fontWeight as light theme
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  fontSize: lightTheme.fontSize,
  fontWeight: lightTheme.fontWeight,
  
  // Dark mode shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export default { lightTheme, darkTheme };
