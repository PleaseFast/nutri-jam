// Core types for the calorie tracking app

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  protein: number; // per 100g
  fat: number; // per 100g
  carbs: number; // per 100g
  calories: number; // per 100g
}

export interface MealRecipe {
  id: string;
  name: string;
  description: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: {
    foodId: string;
    grams: number;
  }[];
}

export interface MealNoteItem {
  id: string;
  name: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
  sourceType: 'manual' | 'food' | 'recipe';
  sourceId?: string;
  grams?: number; // for food items
}

export interface MealNote {
  id: string;
  date: string; // ISO date string
  name: string;
  description: string;
  items: MealNoteItem[]; // Multiple items per meal note
  protein: number; // total grams
  fat: number; // total grams
  carbs: number; // total grams
  calories: number; // total
  // Keep old fields for backward compatibility
  sourceType?: 'manual' | 'food' | 'recipe';
  sourceId?: string;
}

export interface DayTotals {
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
}

export interface UserProfile {
  proteinTarget: number;
  fatTarget: number;
  carbsTarget: number;
  caloriesTarget: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  isStarting?: boolean;
}

export type Language = 'en' | 'ru';
