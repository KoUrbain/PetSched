import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Task } from '@types/db';
import { formatTime } from '@lib/dates';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onPress?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onPress }) => {
  const isDone = task.status === 'DONE';
  return (
    <Pressable
      onPress={() => onPress?.(task)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Pressable onPress={() => onToggle(task)} style={styles.checkbox}>
        <View style={[styles.check, isDone && styles.checkDone]} />
      </Pressable>
      <View style={styles.content}>
        <Text style={[styles.title, isDone && styles.done]}>{task.title}</Text>
        {!!task.due_at && <Text style={styles.due}>Due {formatTime(task.due_at)}</Text>}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  pressed: {
    opacity: 0.8
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ff6f00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  check: {
    width: 14,
    height: 14,
    borderRadius: 7
  },
  checkDone: {
    backgroundColor: '#ff6f00'
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '600'
  },
  done: {
    textDecorationLine: 'line-through',
    color: '#999'
  },
  due: {
    marginTop: 4,
    color: '#666'
  }
});
