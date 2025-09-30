import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, Button, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@store/useAuth';
import { supabase } from '@lib/supabase';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3)
});

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', username: '' }
  });

  const onSubmit = handleSubmit(async (values) => {
    await signUp(values.email, values.password);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    await supabase.from('profiles').upsert({ id: userId, username: values.username });
    await supabase.from('pets').upsert({ user_id: userId }, { onConflict: 'user_id' });
    router.replace('/(tabs)/today');
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Create an account</Text>
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
      <View style={styles.formGroup}>
        <Text>Username</Text>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} autoCapitalize="none" value={value} onChangeText={onChange} />
          )}
        />
      </View>
      <Button title="Sign Up" onPress={onSubmit} />
      <Link href="/auth/sign-in" style={styles.link}>
        Already have an account? Sign in
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
  link: {
    marginTop: 16,
    color: '#ff6f00'
  }
});
