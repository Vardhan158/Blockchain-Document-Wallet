// VaultID "Sovereign Vault" Design System Tokens
// Light Crisp Canvas, Electric Indigo, Emerald Verified, and Premium Cards.

export const VaultTheme = {
  colors: {
    // Primary Brand Accents
    primary: '#4F46E5',           // Electric Indigo
    primaryContainer: '#4338CA',  // Signature Deep Indigo
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#E0E7FF',
    primaryFixed: '#C7D2FE',
    primaryFixedDim: '#A5B4FC',

    // Secondary & Neutrals
    secondary: '#0284C7',         // Sky Blue
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E0F2FE',
    onSecondaryContainer: '#0369A1',
    secondaryFixed: '#BAE6FD',
    onSecondaryFixed: '#0284C7',

    // Canvas & Surfacing (Light Clean Substrate)
    background: '#F8FAFC',        // Light Crisp Slate Canvas
    surface: '#FFFFFF',
    surfaceDim: '#F1F5F9',
    surfaceBright: '#FFFFFF',
    surfaceContainerLowest: '#FFFFFF', // High-contrast White Card
    surfaceContainerLow: '#F8FAFC',    // Slightly elevated white
    surfaceContainer: '#F1F5F9',       // Section background
    surfaceContainerHigh: '#E2E8F0',   // Interactive elements
    surfaceContainerHighest: '#CBD5E1',

    // Text & Typographic Ink
    onSurface: '#0F172A',        // Midnight Slate Ink
    onSurfaceVariant: '#64748B', // Muted Slate Metadata
    outline: '#94A3B8',
    outlineVariant: '#E2E8F0',
    borderHairline: '#F1F5F9',   // Hairline border

    // Sovereign Identity Gradient Surfaces
    cardGradientStart: '#3730A3',  // Deep Indigo
    cardGradientMid: '#4338CA',    // Electric Indigo
    cardGradientEnd: '#2563EB',    // Royal Blue
    cardBorder: 'rgba(99, 102, 241, 0.3)',

    // Semantic Verification Statuses
    verifiedText: '#34D399',
    verifiedBg: '#064E3B',
    verifiedBorder: '#10B981',

    pendingText: '#D97706',
    pendingBg: '#FFFBEB',
    pendingBorder: '#FDE68A',

    alertText: '#DC2626',
    alertBg: '#FEF2F2',
    alertBorder: '#FEE2E2',

    goldAccent: '#F59E0B',        // Cyber Amber Gold
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  shadows: {
    card: {
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    floating: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    hero: {
      shadowColor: '#3730A3',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export default VaultTheme;
