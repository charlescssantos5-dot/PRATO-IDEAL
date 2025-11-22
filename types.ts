export enum Gender {
  MALE = 'Masculino',
  FEMALE = 'Feminino',
  OTHER = 'Outro'
}

export enum Goal {
  LOSE_WEIGHT = 'Perder Peso',
  GAIN_MUSCLE = 'Ganhar Massa',
  MAINTAIN = 'Manter Peso',
  HEALTHY = 'Alimentação Saudável'
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: Gender;
  goal: Goal;
  activityLevel: 'Sedentário' | 'Leve' | 'Moderado' | 'Intenso';
  onboardingComplete: boolean;
  waterGoal: number; // ml
  streak: number;
  badges: string[];
}

export interface Meal {
  name: string;
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  ingredients: string[];
}

export interface DailyDiet {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes: string;
}

export interface DailyWorkout {
  day: string;
  focus: string; // e.g., "Legs", "Push", "Cardio"
  exercises: Exercise[];
}

export interface AppData {
  dietPlan: DailyDiet[];
  workoutPlan: DailyWorkout[];
  shoppingList: { item: string; checked: boolean }[];
  waterConsumed: number;
  lastWaterReset: string; // ISO Date string
}

export type ViewState = 'ONBOARDING' | 'DASHBOARD' | 'DIET' | 'WORKOUT' | 'SHOPPING' | 'PROFILE';
