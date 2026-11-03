import { Stack } from 'expo-router';

/** Root navigator: a stack of screens with a header and back button. */
export default function RootLayout() {
  return <Stack screenOptions={{ title: 'N-Back' }} />;
}
