import { AppData, UserProfile, Goal, Gender } from '../types';

const PROFILE_KEY = 'prato_ideal_profile';
const DATA_KEY = 'prato_ideal_data';

const INITIAL_PROFILE: UserProfile = {
  name: '',
  age: 0,
  weight: 0,
  height: 0,
  gender: Gender.OTHER,
  goal: Goal.HEALTHY,
  activityLevel: 'Moderado',
  onboardingComplete: false,
  waterGoal: 2000,
  streak: 0,
  badges: []
};

const INITIAL_DATA: AppData = {
  dietPlan: [],
  workoutPlan: [],
  shoppingList: [],
  waterConsumed: 0,
  lastWaterReset: new Date().toISOString().split('T')[0]
};

export const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getProfile = (): UserProfile => {
  const stored = localStorage.getItem(PROFILE_KEY);
  return stored ? JSON.parse(stored) : INITIAL_PROFILE;
};

export const saveData = (data: AppData) => {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
};

export const getData = (): AppData => {
  const stored = localStorage.getItem(DATA_KEY);
  let data: AppData = stored ? JSON.parse(stored) : INITIAL_DATA;

  // Check if we need to reset water for a new day
  const today = new Date().toISOString().split('T')[0];
  if (data.lastWaterReset !== today) {
    data.waterConsumed = 0;
    data.lastWaterReset = today;
    saveData(data);
  }

  return data;
};

export const resetApp = () => {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(DATA_KEY);
  window.location.reload();
};
