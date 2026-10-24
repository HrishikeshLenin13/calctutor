import { test } from 'node:test';
import assert from 'node:assert/strict';
import { practiceStreak } from '../lib/progress.ts';
const state = (date) => ({ completedLessons:{}, masteredLessons:{}, lastPracticed:date, streakDays:4 });
test('practice streak uses consecutive local dates', () => {
  const today = new Date(2026, 9, 24, 12);
  assert.equal(practiceStreak(state(new Date(2026, 9, 24, 1).toISOString()), today), 4);
  assert.equal(practiceStreak(state(new Date(2026, 9, 23, 23).toISOString()), today), 5);
  assert.equal(practiceStreak(state(new Date(2026, 9, 22).toISOString()), today), 1);
  assert.equal(practiceStreak(state(null), today), 1);
  assert.equal(practiceStreak(state(new Date(2026, 9, 25).toISOString()), today), 1);
});
