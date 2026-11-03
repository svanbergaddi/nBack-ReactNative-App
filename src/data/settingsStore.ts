// MODEL (data) · Settings saved in AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, Settings } from '../domain/types';

const SETTINGS_KEY = 'nback:settings';

/** Reads saved settings; missing fields (or nothing saved yet) fall back to the defaults. */
export async function loadSettings(): Promise<Settings> {
  const stored = await AsyncStorage.getItem(SETTINGS_KEY);
  return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
}

/** Persists all settings as one JSON value. */
export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
