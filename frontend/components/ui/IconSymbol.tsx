// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import {
  OpaqueColorValue,
  StyleProp,
  TextStyle,
  Platform,
} from 'react-native';

const MAPPING = {
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
} as const;

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
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] ?? 'circle';

  return (
    <MaterialIcons
      name={iconName}
      size={size}
      color={color}
      style={style}
    />
  );
}