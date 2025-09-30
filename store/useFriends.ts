import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@lib/supabase';
import type { Activity, Badge, Friendship, Pet, Profile } from '@types/db';

export interface FriendSummary {
  friendship: Friendship;
  profile: Profile;
  pet: Pet | null;
  badges: Badge[];
}

interface FriendState {
  friends: FriendSummary[];
  requests: Friendship[];
  activities: Activity[];
  loading: boolean;
  error: string | null;
  fetchFriends: () => Promise<void>;
  sendRequest: (username: string) => Promise<void>;
  respondRequest: (id: string, status: Friendship['status']) => Promise<void>;
}

export const useFriends = create<FriendState>()(
  persist(
    (set, get) => ({
      friends: [],
      requests: [],
      activities: [],
      loading: false,
      error: null,
      fetchFriends: async () => {
        set({ loading: true });
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (!user) {
          set({ loading: false });
          return;
        }
        const { data: friendships, error } = await supabase
          .from('friendships')
          .select('*')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
        if (error) {
          set({ error: error.message, loading: false });
          return;
        }
        const friendSummaries: FriendSummary[] = [];
        const requests: Friendship[] = [];
        const friendIds: string[] = [];
        if (friendships) {
          await Promise.all(
            friendships.map(async (friendship) => {
              if (friendship.status !== 'ACCEPTED') {
                if (friendship.addressee_id === user.id) {
                  requests.push(friendship);
                }
                return;
              }
              const friendId = friendship.requester_id === user.id ? friendship.addressee_id : friendship.requester_id;
              friendIds.push(friendId);
              const [{ data: profile }, { data: pet }, { data: badgeRows }] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', friendId).maybeSingle(),
                supabase.from('pets').select('*').eq('user_id', friendId).maybeSingle(),
                supabase
                  .from('user_badges')
                  .select('badge:badges(*)')
                  .eq('user_id', friendId)
                  .limit(3)
              ]);
              if (profile) {
                const badges = badgeRows?.map((row) => row.badge as Badge).filter(Boolean) ?? [];
                friendSummaries.push({
                  friendship,
                  profile,
                  pet: pet ?? null,
                  badges
                });
              }
            })
          );
        }
        let activities: Activity[] = [];
        if (friendIds.length > 0) {
          const { data } = await supabase
            .from('activity_log')
            .select('*')
            .in('user_id', friendIds)
            .order('created_at', { ascending: false })
            .limit(25);
          activities = data ?? [];
        }
        set({ friends: friendSummaries, requests, activities, loading: false });
      },
      sendRequest: async (username) => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .maybeSingle();
        if (error) {
          set({ error: error.message });
          return;
        }
        if (!profile) {
          set({ error: 'User not found' });
          return;
        }
        const { data: requester } = await supabase.auth.getUser();
        await supabase.from('friendships').insert({
          requester_id: requester.user?.id,
          addressee_id: profile.id,
          status: 'PENDING'
        });
      },
      respondRequest: async (id, status) => {
        const { error } = await supabase.from('friendships').update({ status }).eq('id', id);
        if (error) {
          set({ error: error.message });
          return;
        }
        await get().fetchFriends();
      }
    }),
    {
      name: 'petplan-friends',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        friends: state.friends,
        requests: state.requests,
        activities: state.activities
      })
    }
  )
);
