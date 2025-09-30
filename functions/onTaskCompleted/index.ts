// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.3';
import dayjs from 'https://esm.sh/dayjs@1.11.10';
import type { Database, Pet, Task } from '../../types/db.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const XP_PER_TASK = 10;

function calcLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

function nextStreak(
  lastCompletionDate: string | null,
  completedAt: string,
  hadDoneToday: boolean,
  currentStreak: number
) {
  if (hadDoneToday) {
    return currentStreak;
  }
  if (!lastCompletionDate) {
    return 1;
  }
  const completionDay = dayjs(completedAt).startOf('day');
  const lastDay = dayjs(lastCompletionDate).startOf('day');
  const diff = completionDay.diff(lastDay, 'day');
  if (diff === 0) {
    return currentStreak === 0 ? 1 : currentStreak;
  }
  if (diff === 1) {
    return currentStreak + 1;
  }
  return 1;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient<Database>(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } }
  });
  const service = createClient<Database>(supabaseUrl, serviceKey);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = (await req.json()) as { task_id: string };
  const { data: task, error: taskError } = await service
    .from('tasks')
    .select('*')
    .eq('id', body.task_id)
    .maybeSingle();
  if (taskError || !task) {
    return new Response('Task not found', { status: 404 });
  }
  if (task.user_id !== userData.user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  const completion = dayjs();
  const completedAt = completion.toISOString();
  const lastClaim = completion.format('YYYY-MM-DD');
  await service.from('tasks').update({ status: 'DONE' }).eq('id', task.id);

  const { data: pet } = await service.from('pets').select('*').eq('user_id', userData.user.id).maybeSingle();
  const currentStreak = pet?.streak_days ?? 0;
  const hadDoneToday = pet?.last_claim ? dayjs(pet.last_claim).isSame(completion, 'day') : false;
  const streak = nextStreak(pet?.last_claim ?? null, completedAt, hadDoneToday, currentStreak);
  const xp = (pet?.xp ?? 0) + XP_PER_TASK;
  const level = calcLevel(xp);

  const petPayload: Partial<Pet> = {
    xp,
    level,
    streak_days: streak,
    last_claim: lastClaim
  };
  if (pet?.id) {
    await service.from('pets').update(petPayload).eq('id', pet.id);
  } else {
    await service.from('pets').insert({ ...petPayload, user_id: userData.user.id });
  }

  await service.from('activity_log').insert({
    user_id: userData.user.id,
    type: 'TASK_DONE',
    meta: { task_id: task.id }
  });

  if (streak > currentStreak) {
    await service.from('activity_log').insert({
      user_id: userData.user.id,
      type: 'STREAK_UP',
      meta: { streak }
    });
  }
  if (level > (pet?.level ?? 1)) {
    await service.from('activity_log').insert({
      user_id: userData.user.id,
      type: 'LEVEL_UP',
      meta: { level }
    });
  }

  await service.functions.invoke('award_badges', {
    body: {
      user_id: userData.user.id,
      streak,
      level,
      completed_at: completedAt
    }
  });

  return new Response(
    JSON.stringify({
      task: { ...task, status: 'DONE' as Task['status'] },
      pet: { ...(pet ?? {}), ...petPayload }
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
