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

test("valid-practice-time-survives-backup-normalization", () => {
const r=api.normalizeProgress({lastPracticed:'2026-01-01T12:00:00Z'});assert.equal(api.parseProgressBackup(api.serializeProgressBackup(r)).lastPracticed,r.lastPracticed);
});

test("backup-envelope-has-explicit-format-and-version", () => {
const b=JSON.parse(api.serializeProgressBackup(api.normalizeProgress({})));assert.equal(b.format,'calctutor-progress');assert.equal(b.version,1);
});

test("backup-serialization-excludes-unrecognized-fields", () => {
assert.ok(!api.serializeProgressBackup({...api.normalizeProgress({}),token:'secret'}).includes('secret'));
});

test("backup-parser-rejects-malformed", () => {
assert.throws(()=>api.parseProgressBackup("{"));
});

test("backup-parser-rejects-null", () => {
assert.throws(()=>api.parseProgressBackup("null"));
});

test("backup-parser-rejects-array", () => {
assert.throws(()=>api.parseProgressBackup("[]"));
});

test("backup-parser-rejects-unknown-version", () => {
assert.throws(()=>api.parseProgressBackup("{\"format\":\"calctutor-progress\",\"version\":2,\"progress\":{}}"));
});

test("backup-parser-rejects-missing-progress", () => {
assert.throws(()=>api.parseProgressBackup("{\"format\":\"calctutor-progress\",\"version\":1}"));
});

test("backup-parser-rejects-wrong-format", () => {
assert.throws(()=>api.parseProgressBackup("{\"format\":\"other\",\"version\":1,\"progress\":{}}"));
});
