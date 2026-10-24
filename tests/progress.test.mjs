import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getProgress, markLessonComplete } from '../lib/progress.ts';

test('invalid saved progress cannot corrupt the lesson state', () => {
  globalThis.window = {};
  for (const value of [null, [], 42, { completedLessons: null, masteredLessons: [], streakDays: -2, lastPracticed: 'bad' }]) {
    globalThis.localStorage = { getItem: () => JSON.stringify(value), setItem() {} };
    const progress = getProgress();
    assert.deepEqual(progress.completedLessons, {});
    assert.deepEqual(progress.masteredLessons, {});
    assert.equal(progress.lastPracticed, null);
    assert.equal(progress.streakDays, 1);
    assert.equal(markLessonComplete('intro', true).masteredLessons.intro, true);
  }
});

test('valid progress survives normalization and storage failures', () => {
  globalThis.window = {};
  const date = '2026-01-01T00:00:00.000Z';
  globalThis.localStorage = { getItem: () => JSON.stringify({completedLessons:{a:true,b:false,c:'yes'}, masteredLessons:{a:true}, lastPracticed:date, streakDays:3}), setItem() { throw new Error('quota'); } };
  assert.deepEqual(getProgress(), {completedLessons:{a:true,b:false}, masteredLessons:{a:true}, lastPracticed:date, streakDays:3});
  assert.equal(markLessonComplete('b').completedLessons.b, true);
  delete globalThis.window;
  assert.deepEqual(getProgress().completedLessons, {});
});


test('saved mastery always restores lesson completion', () => {
  globalThis.window = {};
  globalThis.localStorage = { getItem: () => JSON.stringify({completedLessons:{a:false}, masteredLessons:{a:true,b:true,c:false}}), setItem() {} };
  assert.deepEqual(getProgress().completedLessons, {a:true,b:true});
  assert.deepEqual(getProgress().masteredLessons, {a:true,b:true,c:false});
  delete globalThis.window;
});
