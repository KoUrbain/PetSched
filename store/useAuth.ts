import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { supabase, signIn as supaSignIn, signOut as supaSignOut, signUp as supaSignUp } from '@lib/supabase';
import type { Profile } from '@types/db';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      profile: null,
      initialized: false,
      loading: false,
      error: null,
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      fetchProfile: async () => {
        const session = get().session;
        if (!session) {
          set({ profile: null });
          return;
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        if (error) {
          set({ error: error.message });
          return;
        }
        if (data) {
          set({ profile: data });
        }
      },
      signIn: async (email, password) => {
        set({ loading: true, error: null });
        const { error, data } = await supaSignIn(email, password);
        if (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
        set({ session: data.session ?? null, loading: false });
        await get().fetchProfile();
      },
      signUp: async (email, password) => {
        set({ loading: true, error: null });
        const { error, data } = await supaSignUp(email, password);
        if (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
        set({ session: data.session ?? null, loading: false });
      },
      signOut: async () => {
        await supaSignOut();
        set({ session: null, profile: null });
      }
    }),
    {
      name: 'petplan-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile })
    }
  )
);

export async function initializeAuth() {
  const { data } = await supabase.auth.getSession();
  useAuth.setState({ session: data.session ?? null });
  if (data.session) {
    await useAuth.getState().fetchProfile();
  }
  useAuth.setState({ initialized: true });
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuth.setState({ session: session ?? null });
    if (session) {
      useAuth.getState().fetchProfile();
    } else {
      useAuth.setState({ profile: null });
    }
  });
}
