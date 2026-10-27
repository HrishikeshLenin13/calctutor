import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../lib/progress.ts';

test("lesson-id-roundtrip-1", () => {
const input=api.normalizeProgress({completedLessons:{["algebra"]:true},masteredLessons:{["algebra"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"algebra").completedLessons,{});assert.equal(input.completedLessons["algebra"],true);
});
