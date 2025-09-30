// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.3';
import dayjs from 'https://esm.sh/dayjs@1.11.10';
import type { Database } from '../../types/db.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient<Database>(supabaseUrl, serviceKey);

type AwardRequest = {
  user_id: string;
  streak: number;
  level: number;
  completed_at: string;
};

type AwardKey =
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'lvl_5'
  | 'lvl_10'
  | 'early_bird'
  | 'night_owl';

const STREAK_BADGES: { threshold: number; key: AwardKey }[] = [
  { threshold: 3, key: 'streak_3' },
  { threshold: 7, key: 'streak_7' },
  { threshold: 30, key: 'streak_30' }
];
const LEVEL_BADGES: { threshold: number; key: AwardKey }[] = [
  { threshold: 5, key: 'lvl_5' },
  { threshold: 10, key: 'lvl_10' }
];

function awardRules(streak: number, level: number, completedAt: string): AwardKey[] {
  const awards: AwardKey[] = [];
  STREAK_BADGES.forEach((badge) => {
    if (streak >= badge.threshold) {
      awards.push(badge.key);
    }
  });
  LEVEL_BADGES.forEach((badge) => {
    if (level >= badge.threshold) {
      awards.push(badge.key);
    }
  });
  const hour = dayjs(completedAt).hour();
  if (hour < 9) awards.push('early_bird');
  if (hour >= 22) awards.push('night_owl');
  return awards;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const body = (await req.json()) as AwardRequest;
  const awards = awardRules(body.streak, body.level, body.completed_at);
  if (awards.length === 0) {
    return new Response(JSON.stringify({ awarded: [] }), { headers: { 'Content-Type': 'application/json' } });
  }
  const { data: badgeRows, error: badgeError } = await supabase
    .from('badges')
    .select('*')
    .in('key', awards);
  if (badgeError) {
    return new Response(badgeError.message, { status: 400 });
  }
  const badgeIds = badgeRows?.map((badge) => badge.id) ?? [];
  if (badgeIds.length === 0) {
    return new Response(JSON.stringify({ awarded: [] }), { headers: { 'Content-Type': 'application/json' } });
  }
  const { data: existing } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', body.user_id)
    .in('badge_id', badgeIds);
  const existingIds = new Set(existing?.map((row) => row.badge_id));
  const newBadges = badgeRows?.filter((badge) => !existingIds.has(badge.id)) ?? [];
  if (newBadges.length === 0) {
    return new Response(JSON.stringify({ awarded: [] }), { headers: { 'Content-Type': 'application/json' } });
  }
  const inserts = newBadges.map((badge) => ({ user_id: body.user_id, badge_id: badge.id }));
  const { error: insertError } = await supabase.from('user_badges').insert(inserts);
  if (insertError) {
    return new Response(insertError.message, { status: 400 });
  }
  await Promise.all(
    newBadges.map((badge) =>
      supabase.from('activity_log').insert({
        user_id: body.user_id,
        type: 'BADGE',
        meta: { badge: badge.key }
      })
    )
  );
  return new Response(
    JSON.stringify({
      awarded: newBadges.map((badge) => ({ id: badge.id, key: badge.key, name: badge.name }))
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
