import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../lib/progress.ts';
test('restored lesson maps reject unsafe and malformed identifiers',()=>{const raw=JSON.parse('{"completedLessons":{"__proto__":true,"constructor":true," padded ":true,"":true,"limits":true}}');assert.deepEqual(api.normalizeProgress(raw).completedLessons,{limits:true});});
