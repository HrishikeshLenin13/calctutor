import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../lib/progress.ts';

test("null-progress-restores-a-valid-empty-state", () => {
const r=api.normalizeProgress(null);assert.deepEqual(r.completedLessons,{});assert.equal(r.lastPracticed,null);assert.equal(r.streakDays,1);
});

test("nonobject-array-progress-is-not-a-record", () => {
assert.deepEqual(api.normalizeProgress([]),api.normalizeProgress(null));
});

test("nonobject-scalar-progress-is-not-a-record", () => {
assert.deepEqual(api.normalizeProgress(3),api.normalizeProgress(null));
});

test("nonobject-text-progress-is-not-a-record", () => {
assert.deepEqual(api.normalizeProgress('bad'),api.normalizeProgress(null));
});

test("completion-maps-keep-only-boolean-values", () => {
assert.deepEqual(api.normalizeProgress({completedLessons:{a:true,b:false,c:1,d:'yes'}}).completedLessons,{a:true,b:false});
});

test("mastery-implies-completion-without-double-counting", () => {
const r=api.normalizeProgress({completedLessons:{a:true},masteredLessons:{a:true,b:true}});assert.equal(api.progressSummary(r).completed,2);assert.equal(api.progressSummary(r).mastered,2);
});

test("false-mastery-does-not-imply-completion", () => {
const r=api.normalizeProgress({masteredLessons:{a:false}});assert.equal(api.progressSummary(r).completed,0);assert.equal(api.progressSummary(r).mastered,0);
});

test("normalizer-excludes-empty-lesson-ids", () => {
const r=api.normalizeProgress({completedLessons:Object.fromEntries([["",true]])});assert.deepEqual(r.completedLessons,{});
});
