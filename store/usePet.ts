import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@lib/supabase';
import type { Pet, Badge, UserBadge } from '@types/db';

interface PetState {
  pet: Pet | null;
  badges: (Badge & { awarded_at: string })[];
  loading: boolean;
  error: string | null;
  fetchPet: () => Promise<void>;
}

export const usePet = create<PetState>()(
  persist(
    (set) => ({
      pet: null,
      badges: [],
      loading: false,
      error: null,
      fetchPet: async () => {
        set({ loading: true });
        const [{ data: petData, error: petError }, { data: badgeData, error: badgeError }] = await Promise.all([
          supabase.from('pets').select('*').maybeSingle(),
          supabase
            .from('user_badges')
            .select('*, badge:badges(*)')
            .order('awarded_at', { ascending: false })
        ]);
        if (petError || badgeError) {
          set({
            error: petError?.message ?? badgeError?.message ?? 'Unknown error',
            loading: false
          });
          return;
        }
        const decoratedBadges =
          badgeData?.map((entry) => ({
            ...(entry.badge as Badge),
            awarded_at: (entry as UserBadge).awarded_at
          })) ?? [];
        set({ pet: petData ?? null, badges: decoratedBadges, loading: false });
      }
    }),
    {
      name: 'petplan-pet',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ pet: state.pet, badges: state.badges })
    }
  )
);
