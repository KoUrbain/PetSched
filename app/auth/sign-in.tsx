import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, Button, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useAuth } from '@store/useAuth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export default function SignInScreen() {
  const { signIn, loading, error } = useAuth();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = handleSubmit(async (values) => {
    await signIn(values.email, values.password);
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Welcome back</Text>
      <View style={styles.formGroup}>
        <Text>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>
      <View style={styles.formGroup}>
        <Text>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} secureTextEntry value={value} onChangeText={onChange} />
          )}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={loading ? 'Signing in...' : 'Sign In'} onPress={onSubmit} />
      <Link href="/auth/sign-up" style={styles.link}>
        Need an account? Create one
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16
  },
  heading: {
    fontSize: 24,
    fontWeight: '700'
  },
  formGroup: {
    gap: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12
  },
  error: {
    color: '#c62828'
  },
  link: {
    marginTop: 16,
    color: '#ff6f00'
  }
});
