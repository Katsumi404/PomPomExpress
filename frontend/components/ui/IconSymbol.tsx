// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle, Platform } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'person.crop.circle.fill': 'person',
  'person.fill': 'person',
  'group.fill': 'group',
  'sparkles': 'auto-fix-high',
  'plus.slash.minus': 'calculate',
  'settings': 'settings',
  'star.fill': 'star', 
  'star': 'star-border',
  
  // Element icons
  'circle': 'circle',
  'flame': 'local-fire-department',
  'droplet': 'water-drop',
  'wind': 'air',
  'zap': 'bolt',
  'leaf': 'eco',
  'snowflake': 'ac-unit',
  'mountain': 'landscape',
  'atom': 'science',
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Platform-specific icon names
  const iconName =
    Platform.OS === 'ios'
      ? name
      : MAPPING[name] || 'circle'; // Default to circle for Android/Web if mapping not found

  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}