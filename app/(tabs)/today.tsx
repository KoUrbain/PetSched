import React, { useCallback } from 'react';
import { SafeAreaView, FlatList, View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTasks } from '@store/useTasks';
import { TaskItem } from '@components/TaskItem';
import dayjs from '@lib/dates';

const schema = z.object({
  title: z.string().min(1, 'Give your task a name'),
  notes: z.string().optional()
});

export default function TodayScreen() {
  const { tasks, fetchTasks, addTask, toggleTask, loading } = useTasks();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', notes: '' }
  });

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const onSubmit = handleSubmit(async (values) => {
    await addTask({
      title: values.title,
      notes: values.notes ?? null,
      due_at: dayjs().toISOString()
    });
    reset();
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Quick add a task"
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          )}
        />
        {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}
        <Button title="Add" onPress={onSubmit} />
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchTasks}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <TaskItem task={item} onToggle={toggleTask} />}
        ListEmptyComponent={<Text style={styles.empty}>No tasks yet. Create one above!</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fdfcfb'
  },
  form: {
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8
  },
  error: {
    color: '#ff6f00',
    marginBottom: 8
  },
  list: {
    paddingBottom: 48
  },
  empty: {
    textAlign: 'center',
    marginTop: 64,
    color: '#999'
  }
});
