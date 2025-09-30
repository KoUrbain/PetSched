import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, Button, Switch, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@store/useAuth';
import { supabase } from '@lib/supabase';
import { ensureNotificationPermission } from '@lib/notifications';

const schema = z.object({
  username: z.string().min(3),
  avatar_url: z.string().url().optional()
});

export default function ProfileScreen() {
  const { profile, signOut, fetchProfile } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: profile?.username ?? '',
      avatar_url: profile?.avatar_url ?? ''
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!profile) return;
    await supabase
      .from('profiles')
      .update({ username: values.username, avatar_url: values.avatar_url })
      .eq('id', profile.id);
    await fetchProfile();
  });

  const onToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      await ensureNotificationPermission();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <View style={styles.formGroup}>
        <Text>Username</Text>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} value={value} onChangeText={onChange} />
          )}
        />
      </View>
      <View style={styles.formGroup}>
        <Text>Avatar URL</Text>
        <Controller
          control={control}
          name="avatar_url"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} value={value} onChangeText={onChange} />
          )}
        />
      </View>
      <Button title="Save" onPress={onSubmit} />
      <View style={styles.switchRow}>
        <Text>Task reminders</Text>
        <Switch value={notificationsEnabled} onValueChange={onToggleNotifications} />
      </View>
      <Button title="Sign out" onPress={signOut} color="#c62828" />
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24
  }
});


  React.useEffect(() => {
    reset({
      username: profile?.username ?? '',
      avatar_url: profile?.avatar_url ?? ''
    });
  }, [profile, reset]);
