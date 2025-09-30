import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { initializeAuth, useAuth } from '@store/useAuth';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const { initialized, session } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (session) {
      router.replace('/(tabs)/today');
    } else {
      router.replace('/auth/sign-in');
    }
  }, [initialized, session, router]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}
