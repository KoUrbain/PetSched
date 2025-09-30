import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@lib/supabase';
import type { Task } from '@types/db';
import dayjs from '@lib/dates';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  queuedToggles: string[];
  fetchTasks: () => Promise<void>;
  addTask: (payload: Partial<Task>) => Promise<void>;
  updateTask: (id: string, payload: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (task: Task) => Promise<void>;
}

export const useTasks = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      error: null,
      queuedToggles: [],
      fetchTasks: async () => {
        set({ loading: true });
        const { data, error } = await supabase.from('tasks').select('*').order('due_at', { ascending: true });
        if (error) {
          set({ error: error.message, loading: false });
          return;
        }
        set({ tasks: data ?? [], loading: false });
      },
      addTask: async (payload) => {
        const { error, data } = await supabase
          .from('tasks')
          .insert({
            title: payload.title ?? 'Task',
            notes: payload.notes ?? null,
            due_at: payload.due_at ?? dayjs().toISOString(),
            repeat_rule: payload.repeat_rule ?? null,
            remind: payload.remind ?? false
          })
          .select('*')
          .single();
        if (error) {
          set({ error: error.message });
          return;
        }
        set({ tasks: [data, ...get().tasks] });
      },
      updateTask: async (id, payload) => {
        const { error, data } = await supabase
          .from('tasks')
          .update({
            title: payload.title,
            notes: payload.notes ?? null,
            due_at: payload.due_at ?? null,
            repeat_rule: payload.repeat_rule ?? null,
            remind: payload.remind ?? false,
            status: payload.status
          })
          .eq('id', id)
          .select('*')
          .single();
        if (error) {
          set({ error: error.message });
          return;
        }
        set({ tasks: get().tasks.map((task) => (task.id === id ? data : task)) });
      },
      deleteTask: async (id) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) {
          set({ error: error.message });
          return;
        }
        set({ tasks: get().tasks.filter((task) => task.id !== id) });
      },
      toggleTask: async (task) => {
        const isDone = task.status === 'DONE';
        try {
          if (!isDone) {
            await supabase.functions.invoke('onTaskCompleted', {
              body: { task_id: task.id }
            });
          } else {
            await supabase.from('tasks').update({ status: 'PENDING' }).eq('id', task.id);
          }
          await get().fetchTasks();
        } catch (error) {
          console.warn('Failed to toggle task, queueing', error);
          set({ queuedToggles: [...get().queuedToggles, task.id] });
        }
      }
    }),
    {
      name: 'petplan-tasks',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tasks: state.tasks, queuedToggles: state.queuedToggles })
    }
  )
);
