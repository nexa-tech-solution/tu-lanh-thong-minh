
export type Category = 'Thịt & Hải sản' | 'Rau củ' | 'Trái cây' | 'Sữa & Trứng' | 'Gia vị' | 'Khác';

export interface FoodItem {
  id: string;
  name: string;
  category: Category;
  expiryDate: string; // ISO format
  quantity: string;
  unit: string;
  addedAt: string;
  icon?: string; // Biểu tượng tùy chọn
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  reason: string;
  calories: number; // Ước tính calo (kcal)
}

export type Language = 'vi' | 'en' | 'ja' | 'ko' | 'zh';

export interface AppState {
  items: FoodItem[];
  favorites: Recipe[];
  language: Language;
}
