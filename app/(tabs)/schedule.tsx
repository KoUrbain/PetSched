import React, { useMemo } from 'react';
import { SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTasks } from '@store/useTasks';
import { TaskItem } from '@components/TaskItem';
import { formatDay, isSameDay, sevenDayRange } from '@lib/dates';
import { occurrencesWithin, parseRepeatRule } from '@lib/repeat';

export default function ScheduleScreen() {
  const { tasks, fetchTasks, toggleTask } = useTasks();

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const sections = useMemo(() => {
    const range = sevenDayRange();
    return range.map((day) => {
      const base = tasks.filter((task) => task.due_at && isSameDay(task.due_at, day));
      const repeating = tasks
        .filter((task) => task.repeat_rule)
        .flatMap((task) => {
          const rule = parseRepeatRule(task.repeat_rule);
          if (!rule) return [];
          const occurrences = occurrencesWithin(rule, day.startOf('day').toDate(), day.endOf('day').toDate());
          if (occurrences.length === 0) return [];
          return [
            {
              ...task,
              id: `${task.id}-${day.toISOString()}`,
              due_at: day.toISOString()
            }
          ];
        });
      return {
        title: formatDay(day),
        data: [...base, ...repeating]
      };
    });
  }, [tasks]);

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskItem task={item} onToggle={toggleTask} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No scheduled tasks yet.</Text>}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12
  },
  sectionHeader: {
    paddingVertical: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  empty: {
    marginTop: 48,
    textAlign: 'center',
    color: '#999'
  },
  list: {
    paddingBottom: 48
  }
});
