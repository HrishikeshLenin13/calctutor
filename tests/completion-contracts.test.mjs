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

test("normalizer-excludes-padded-lesson-ids", () => {
const r=api.normalizeProgress({completedLessons:Object.fromEntries([[" a ",true]])});assert.deepEqual(r.completedLessons,{});
});

test("normalizer-excludes-oversized-lesson-ids", () => {
const r=api.normalizeProgress({completedLessons:Object.fromEntries([["xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",true]])});assert.deepEqual(r.completedLessons,{});
});

test("normalizer-excludes-prototype-lesson-ids", () => {
const r=api.normalizeProgress({completedLessons:Object.fromEntries([["__proto__",true]])});assert.deepEqual(r.completedLessons,{});
});

test("normalizer-excludes-constructor-lesson-ids", () => {
const r=api.normalizeProgress({completedLessons:Object.fromEntries([["constructor",true]])});assert.deepEqual(r.completedLessons,{});
});

test("normalization-does-not-alias-input-maps", () => {
const raw={completedLessons:{a:true}},r=api.normalizeProgress(raw);r.completedLessons.a=false;assert.equal(raw.completedLessons.a,true);
});

test("normalization-is-idempotent-for-valid-progress", () => {
const r=api.normalizeProgress({masteredLessons:{a:true},streakDays:4});assert.deepEqual(api.normalizeProgress(r),r);
});

test("streak-normalizes-negative-values", () => {
assert.equal(api.normalizeProgress({streakDays:-1}).streakDays,1);
});

test("streak-normalizes-fractional-values", () => {
assert.equal(api.normalizeProgress({streakDays:1.5}).streakDays,1);
});

test("streak-normalizes-nonfinite-values", () => {
assert.equal(api.normalizeProgress({streakDays:Infinity}).streakDays,1);
});

test("streak-normalizes-unsafe-values", () => {
assert.equal(api.normalizeProgress({streakDays:Number.MAX_SAFE_INTEGER+1}).streakDays,1);
});

test("invalid-practice-dates-are-not-preserved", () => {
for(const lastPracticed of ['bad','',123])assert.equal(api.normalizeProgress({lastPracticed}).lastPracticed,null);
});
