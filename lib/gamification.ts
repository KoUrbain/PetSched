import dayjs from './dates';

export const XP_PER_TASK = 10;

export function calcLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

export function calcXpProgress(xp: number) {
  const remainder = xp % 100;
  return remainder < 0 ? 0 : remainder;
}

export function nextStreak(
  lastCompletionDate: string | null,
  completedAt: string | Date,
  hadDoneToday: boolean,
  currentStreak = 0
) {
  if (hadDoneToday) {
    return currentStreak;
  }
  const completionDay = dayjs(completedAt).startOf('day');
  if (!lastCompletionDate) {
    return 1;
  }
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

export function awardRules(streak: number, level: number, completedAt: string | Date): AwardKey[] {
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
  if (hour < 9) {
    awards.push('early_bird');
  }
  if (hour >= 22) {
    awards.push('night_owl');
  }
  return awards;
}

export function isPetSad(lastDone: string | null, reference: string | Date = new Date()) {
  if (!lastDone) return true;
  const diffHours = dayjs(reference).diff(dayjs(lastDone), 'hour');
  return diffHours >= 48;
}

export type PetMood = 'happy' | 'sad';

export function petMood(lastDone: string | null, reference: string | Date = new Date()): PetMood {
  return isPetSad(lastDone, reference) ? 'sad' : 'happy';
}
