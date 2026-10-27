import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../lib/progress.ts';

test("lesson-id-roundtrip-1", () => {
const input=api.normalizeProgress({completedLessons:{["algebra"]:true},masteredLessons:{["algebra"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"algebra").completedLessons,{});assert.equal(input.completedLessons["algebra"],true);
});

test("lesson-id-roundtrip-2", () => {
const input=api.normalizeProgress({completedLessons:{["a/b"]:true},masteredLessons:{["a/b"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"a/b").completedLessons,{});assert.equal(input.completedLessons["a/b"],true);
});

test("lesson-id-roundtrip-3", () => {
const input=api.normalizeProgress({completedLessons:{["level 1"]:true},masteredLessons:{["level 1"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"level 1").completedLessons,{});assert.equal(input.completedLessons["level 1"],true);
});

test("lesson-id-roundtrip-4", () => {
const input=api.normalizeProgress({completedLessons:{["\u00e9cole"]:true},masteredLessons:{["\u00e9cole"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"\u00e9cole").completedLessons,{});assert.equal(input.completedLessons["\u00e9cole"],true);
});
