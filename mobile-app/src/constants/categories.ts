export const ALL_CATEGORIES = [
  'Fertilizer', 'Seeds', 'Labour', 'Food',
  'Milk Sale', 'Crop Sale', 'Other',
] as const;

export type Category = typeof ALL_CATEGORIES[number];

export const CATEGORY_EMOJI: Record<Category, string> = {
  'Fertilizer': '🌾',
  'Seeds':      '🌱',
  'Labour':     '👷',
  'Food':       '🛒',
  'Milk Sale':  '🥛',
  'Crop Sale':  '📈',
  'Other':      '⚡',
};

export const CATEGORY_COLOR: Record<Category, string> = {
  'Fertilizer': '#10b981',
  'Seeds':      '#0d9488',
  'Labour':     '#3b82f6',
  'Food':       '#f59e0b',
  'Milk Sale':  '#06b6d4',
  'Crop Sale':  '#8b5cf6',
  'Other':      '#94a3b8',
};