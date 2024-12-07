export const APP_NAME = 'Chromir';

export const TOKEN_COSTS = {
  MODEL_CREATION: 20,
  IMAGE_GENERATION: 5,
} as const;

export const MODEL_TYPES = {
  category: {
    title: 'Category',
    description: 'Groups similar products by their basic type or purpose',
    example: 'Example: "Drapery rod finials"'
  },
  collection: {
    title: 'Collection',
    description: 'Products share visual style but serve different functions',
    example: 'Example: "Bellwood"'
  },
  item: {
    title: 'Item',
    description: 'Single product that may have variations like color/size',
    example: 'Example: "Oslo Dining Chair", "Lunar Table Lamp"'
  }
} as const;