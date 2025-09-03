import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabBarIconProps {
  name: string;
  color: string;
  size: number;
}

// Professional icon mapping using Ionicons
const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  'house.fill': 'home',
  'thermometer': 'thermometer',
  'exclamationmark.bubble.fill': 'chatbubble-ellipses',
  'megaphone.fill': 'megaphone',
  'person.fill': 'person',
};

export default function TabBarIcon({ name, color, size }: TabBarIconProps) {
  const iconName = iconMap[name] || 'ellipse';
  
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={iconName} size={size} color={color} />
    </View>
  );
}