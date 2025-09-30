// Generated types for Supabase schema. Simplified snapshot for client typing.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      pets: {
        Row: {
          id: string;
          user_id: string;
          xp: number;
          level: number;
          streak_days: number;
          last_claim: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          xp?: number;
          level?: number;
          streak_days?: number;
          last_claim?: string | null;
          created_at?: string;
        };
        Update: {
          xp?: number;
          level?: number;
          streak_days?: number;
          last_claim?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          notes: string | null;
          due_at: string | null;
          repeat_rule: string | null;
          status: 'PENDING' | 'DONE' | 'SKIPPED';
          remind: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          notes?: string | null;
          due_at?: string | null;
          repeat_rule?: string | null;
          status?: 'PENDING' | 'DONE' | 'SKIPPED';
          remind?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          notes?: string | null;
          due_at?: string | null;
          repeat_rule?: string | null;
          status?: 'PENDING' | 'DONE' | 'SKIPPED';
          remind?: boolean;
          created_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          key: string;
          name: string;
          description: string;
          icon: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          description: string;
          icon: string;
        };
        Update: {
          key?: string;
          name?: string;
          description?: string;
          icon?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          awarded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          awarded_at?: string;
        };
        Update: {
          badge_id?: string;
          awarded_at?: string;
        };
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
          created_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
          created_at?: string;
        };
        Update: {
          status?: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
          created_at?: string;
        };
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string;
          type: 'TASK_DONE' | 'STREAK_UP' | 'LEVEL_UP' | 'BADGE';
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'TASK_DONE' | 'STREAK_UP' | 'LEVEL_UP' | 'BADGE';
          meta?: Json | null;
          created_at?: string;
        };
        Update: {
          type?: 'TASK_DONE' | 'STREAK_UP' | 'LEVEL_UP' | 'BADGE';
          meta?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables = Database['public']['Tables'];
export type Profile = Tables['profiles']['Row'];
export type Pet = Tables['pets']['Row'];
export type Task = Tables['tasks']['Row'];
export type Badge = Tables['badges']['Row'];
export type UserBadge = Tables['user_badges']['Row'];
export type Friendship = Tables['friendships']['Row'];
export type Activity = Tables['activity_log']['Row'];
