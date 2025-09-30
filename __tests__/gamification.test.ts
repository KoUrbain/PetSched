import { awardRules, calcLevel, nextStreak } from '@lib/gamification';

describe('calcLevel', () => {
  it('returns level 1 for less than 100 xp', () => {
    expect(calcLevel(0)).toBe(1);
    expect(calcLevel(99)).toBe(1);
  });

  it('increments every 100 xp', () => {
    expect(calcLevel(100)).toBe(2);
    expect(calcLevel(250)).toBe(3);
  });
});

describe('nextStreak', () => {
  const today = new Date().toISOString();

  it('starts a new streak when no history', () => {
    expect(nextStreak(null, today, false, 0)).toBe(1);
  });

  it('increments when previous day was completed', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(nextStreak(yesterday, today, false, 3)).toBe(4);
  });

  it('resets when gap is longer than a day', () => {
    const old = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(nextStreak(old, today, false, 5)).toBe(1);
  });
});

describe('awardRules', () => {
  const completion = new Date().toISOString();

  it('awards streak badges at thresholds', () => {
    const awards = awardRules(7, 1, completion);
    expect(awards).toEqual(expect.arrayContaining(['streak_3', 'streak_7']));
  });

  it('awards level badges at thresholds', () => {
    const awards = awardRules(1, 10, completion);
    expect(awards).toEqual(expect.arrayContaining(['lvl_5', 'lvl_10']));
  });

  it('awards early bird for morning completion', () => {
    const morning = new Date();
    morning.setHours(6, 0, 0, 0);
    const awards = awardRules(1, 1, morning.toISOString());
    expect(awards).toContain('early_bird');
  });
});
