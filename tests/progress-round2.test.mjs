import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../lib/progress.ts';
const progress={completedLessons:{a:true,b:false},masteredLessons:{a:true,c:true},lastPracticed:null,streakDays:2};
test('summary counts boolean completion and includes mastery without duplicates', () => { assert.deepEqual(api.progressSummary(progress),{completed:2,mastered:2,lastPracticed:null,streakDays:2}); });
test('portable progress backups contain a versioned allowlist', () => { const backup=JSON.parse(api.serializeProgressBackup({...progress,extra:'not exported'})); assert.equal(backup.version,1); assert.equal(backup.format,'calctutor-progress'); assert.ok(!JSON.stringify(backup).includes('not exported')); assert.equal(backup.progress.completedLessons.c,true); });
