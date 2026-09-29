import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface VaultLogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  showText?: boolean;
}

export const VaultLogo: React.FC<VaultLogoProps> = ({
  size = 'md',
  subtitle,
  showText = true,
}) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <View style={styles.container}>
      {/* 3D Shield Crest Emblem Badge */}
      <View
        style={[
          styles.badge,
          isSmall ? styles.badgeSmall : isLarge ? styles.badgeLarge : styles.badgeMedium,
        ]}>
        <Text style={[styles.shieldIcon, isSmall ? styles.iconSmall : isLarge ? styles.iconLarge : styles.iconMedium]}>
          🛡️
        </Text>
        <View style={styles.greenDot} />
      </View>

      {/* Brand Title & Subtitle */}
      {showText && (
        <View style={styles.textCol}>
          <Text
            style={[
              styles.brandTitle,
              isLarge && styles.brandTitleLarge,
              isSmall && styles.brandTitleSmall,
            ]}>
            VAULT / ID
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, isLarge && styles.subtitleLarge]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#5145E5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  badgeSmall: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  badgeMedium: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  badgeLarge: {
    width: 68,
    height: 68,
    borderRadius: 22,
  },
  shieldIcon: {
    textAlign: 'center',
  },
  iconSmall: {
    fontSize: 18,
  },
  iconMedium: {
    fontSize: 24,
  },
  iconLarge: {
    fontSize: 34,
  },
  greenDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  textCol: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  brandTitleSmall: {
    fontSize: 13,
    letterSpacing: 1.2,
  },
  brandTitleLarge: {
    fontSize: 22,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  subtitleLarge: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});

export default VaultLogo;
