import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface GeorgetownLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark';
  showAppName?: boolean;
}

export default function GeorgetownLogo({ 
  size = 'medium', 
  variant = 'dark',
  showAppName = true
}: GeorgetownLogoProps) {
  const styles = getStyles(size, variant);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.crestWrapper}>
          <View style={styles.shield}>
            <View style={styles.innerShield}>
              <Text style={styles.shieldText}>GP</Text>
            </View>
            <View style={styles.shieldAccent} />
          </View>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.schoolName}>GEORGETOWN</Text>
          <Text style={styles.schoolSubname}>PREPARATORY SCHOOL</Text>
          
          {showAppName && (
            <>
              <View style={styles.divider} />
              <Text style={styles.appName}>DormLife</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const getStyles = (size: string, variant: string) => {
  const isLight = variant === 'light';
  const textColor = isLight ? Colors.textOnPrimary : Colors.text;
  const accentColor = isLight ? Colors.textOnPrimary : Colors.primary;
  const shadowColor = isLight ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)';
  
  let containerHeight, shieldSize, fontSize, subFontSize, appFontSize, spacing;
  
  switch (size) {
    case 'small':
      containerHeight = 70;
      shieldSize = 36;
      fontSize = 13;
      subFontSize = 9;
      appFontSize = 11;
      spacing = 6;
      break;
    case 'large':
      containerHeight = 140;
      shieldSize = 72;
      fontSize = 20;
      subFontSize = 14;
      appFontSize = 18;
      spacing = 12;
      break;
    default: // medium
      containerHeight = 100;
      shieldSize = 54;
      fontSize = 16;
      subFontSize = 11;
      appFontSize = 15;
      spacing = 8;
  }

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      paddingVertical: spacing * 2,
    },
    crestWrapper: {
      marginBottom: spacing * 1.5,
      shadowColor: shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    shield: {
      width: shieldSize,
      height: shieldSize,
      borderRadius: shieldSize / 5,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.background,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    innerShield: {
      width: shieldSize - 6,
      height: shieldSize - 6,
      backgroundColor: accentColor,
      borderRadius: (shieldSize - 6) / 5,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isLight ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
    },
    shieldAccent: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 16,
      height: 16,
      backgroundColor: Colors.accent,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: Colors.background,
    },
    shieldText: {
      fontSize: shieldSize * 0.28,
      fontWeight: '800',
      color: isLight ? Colors.primary : Colors.textOnPrimary,
      letterSpacing: 1.2,
      textShadowColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    textContainer: {
      alignItems: 'center',
    },
    schoolName: {
      fontSize: fontSize,
      fontWeight: '800',
      color: textColor,
      letterSpacing: 2,
      marginBottom: 2,
      textShadowColor: shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    schoolSubname: {
      fontSize: subFontSize,
      fontWeight: '600',
      color: textColor,
      letterSpacing: 1,
      opacity: 0.85,
      marginBottom: spacing / 2,
    },
    divider: {
      width: 50,
      height: 2,
      backgroundColor: accentColor,
      marginVertical: spacing,
      borderRadius: 1,
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    appName: {
      fontSize: appFontSize,
      fontWeight: '700',
      color: accentColor,
      letterSpacing: 1,
      textShadowColor: shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
};