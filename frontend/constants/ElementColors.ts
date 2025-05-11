import { Colors } from '@/constants/Colors';

// Map of element names to their corresponding colors
export const ElementColors: Record<string, string> = {
  // Standard elements
  pyro: Colors.common.primary,
  hydro: Colors.common.success,
  anemo: Colors.success,
  electro: Colors.primary,
  dendro: Colors.danger,
  cryo: Colors.light.icon,
  geo: Colors.dark.icon,
  
  // Additional elements
  quantum: Colors.light.tabIconSelected,
  imaginary: Colors.dark.tabIconSelected,
  lightning: Colors.primary,
  
  // Aliases for different naming conventions
  fire: Colors.common.primary,
  water: Colors.common.success,
  wind: Colors.success,
  ice: Colors.light.icon,
  earth: Colors.dark.icon,
  electric: Colors.primary,
  nature: Colors.danger,
};

/**
 * Gets the color for a specified element
 * @param element The element name (case insensitive)
 * @param fallbackColor Color to return if element isn't found
 * @returns The color associated with the element or the fallback color
 */
export const getElementColor = (element?: string, fallbackColor: string = Colors.light.secondaryText): string => {
  if (!element) return fallbackColor;
  
  const normalizedElement = element.toLowerCase();
  return ElementColors[normalizedElement] || fallbackColor;
};

/**
 * Gets element display properties including color and icon
 * @param element The element name (case insensitive)
 * @returns Object with color and icon properties
 */
export const getElementDisplay = (element?: string) => {
  if (!element) return { color: Colors.light.secondaryText, icon: 'circle' };
  
  const normalizedElement = element.toLowerCase();
  
  // Map elements to their icons
  const iconMap: Record<string, string> = {
    pyro: 'flame',
    hydro: 'droplet',
    anemo: 'wind',
    electro: 'zap',
    dendro: 'leaf',
    cryo: 'snowflake',
    geo: 'mountain',
    quantum: 'atom',
    imaginary: 'sparkles',
    lightning: 'zap',
    // Add aliases if needed
    fire: 'flame',
    water: 'droplet',
    wind: 'wind',
    electric: 'zap',
    ice: 'snowflake',
    earth: 'mountain',
    nature: 'leaf',
  };
  
  return {
    color: getElementColor(element),
    icon: iconMap[normalizedElement] || 'circle'
  };
};