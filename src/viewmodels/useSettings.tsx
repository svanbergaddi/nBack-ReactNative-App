// VIEWMODEL · Settings shared by all screens, persisted on change.

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { loadSettings, saveSettings } from '../data/settingsStore';
import { DEFAULT_SETTINGS, Settings } from '../domain/types';

interface SettingsViewModel {
  settings: Settings;
  /** Applies the changes in memory immediately and persists them in the background. */
  updateSettings: (changes: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsViewModel | null>(null);

/** Holds the one shared settings state, so Home, Game and Settings always agree. Wraps the app in _layout. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const updateSettings = (changes: Partial<Settings>) => {
    const next = { ...settings, ...changes };
    setSettings(next);
    void saveSettings(next);
  };

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>;
}

/** Settings ViewModel: current settings + updateSettings command. */
export function useSettings(): SettingsViewModel {
  const viewModel = useContext(SettingsContext);
  if (!viewModel) throw new Error('useSettings must be used inside SettingsProvider');
  return viewModel;
}
