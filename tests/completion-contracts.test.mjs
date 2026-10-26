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
