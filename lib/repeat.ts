import dayjs from './dates';

export type RepeatRule =
  | { type: 'DAILY' }
  | { type: 'WEEKLY'; days: number[] };

const WEEKDAY_MAP: Record<string, number> = {
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
  SU: 0
};

export function parseRepeatRule(rule: string | null): RepeatRule | null {
  if (!rule) return null;
  if (rule === 'DAILY') {
    return { type: 'DAILY' };
  }
  if (rule.startsWith('WEEKLY:')) {
    const parts = rule.replace('WEEKLY:', '').split(',');
    const days = parts
      .map((p) => WEEKDAY_MAP[p.trim().toUpperCase()] ?? null)
      .filter((v): v is number => v !== null);
    return { type: 'WEEKLY', days };
  }
  return null;
}

export function occurrencesWithin(rule: RepeatRule | null, from: string | Date, to: string | Date) {
  if (!rule) return [];
  const start = dayjs(from).startOf('day');
  const end = dayjs(to).endOf('day');
  const days: string[] = [];
  if (rule.type === 'DAILY') {
    let cursor = start.clone();
    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
      days.push(cursor.toISOString());
      cursor = cursor.add(1, 'day');
    }
  } else if (rule.type === 'WEEKLY') {
    let cursor = start.clone();
    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
      if (rule.days.includes(cursor.day())) {
        days.push(cursor.toISOString());
      }
      cursor = cursor.add(1, 'day');
    }
  }
  return days;
}
