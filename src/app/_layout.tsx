// VIEW · Root layout: shared settings + screen stack. The first of our files to run.

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { COLORS } from '../components/theme';
import { SettingsProvider } from '../viewmodels/useSettings';

/** Root navigator: a stack of screens with a dark header, gold back button, sharing one settings state. */
export default function RootLayout() {
  return (
    <SettingsProvider>
      {/* Light status-bar text on the dark header. expo-status-bar works in Expo Go;
          the header's own statusBarStyle option needs a native Info.plist change on iOS. */}
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          title: 'N-Back',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.gold,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      />
    </SettingsProvider>
  );
}
