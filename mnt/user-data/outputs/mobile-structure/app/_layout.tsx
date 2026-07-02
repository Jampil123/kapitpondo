/**
 * app/_layout.tsx — ROOT layout (the glue that makes everything run).
 *
 * If you already have a root _layout, MERGE these three pieces into it rather
 * than overwriting: (1) load Poppins fonts, (2) wrap in AuthProvider +
 * GroupProvider, (3) the auth routing guard.
 */
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GroupProvider } from '@/context/GroupContext';
import { semantic } from '@/theme/colors';

SplashScreen.preventAutoHideAsync();

// Signed-in users may still visit these (verify-later flow) without being
// bounced back into the app.
const VERIFY_SCREENS = ['identity', 'pending', 'verify-landing'];

function RootNavigator() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    const inAuth = segments[0] === '(auth)';
    const onVerify = inAuth && VERIFY_SCREENS.includes(segments[1] as string);

    if (status === 'signedOut' && !inAuth) {
      router.replace('/(auth)/signin');
    } else if (status === 'signedIn' && inAuth && !onVerify) {
      router.replace('/(app)/(tabs)');
    }
  }, [status, segments]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: semantic.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={semantic.brand} />
      </View>
    );
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <GroupProvider>
        <RootNavigator />
      </GroupProvider>
    </AuthProvider>
  );
}
