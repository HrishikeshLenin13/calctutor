import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../lib/progress.ts';
const progress={completedLessons:{a:true,b:false},masteredLessons:{a:true,c:true},lastPracticed:null,streakDays:2};
test('summary counts boolean completion and includes mastery without duplicates', () => { assert.deepEqual(api.progressSummary(progress),{completed:2,mastered:2,lastPracticed:null,streakDays:2}); });
test('portable progress backups contain a versioned allowlist', () => { const backup=JSON.parse(api.serializeProgressBackup({...progress,extra:'not exported'})); assert.equal(backup.version,1); assert.equal(backup.format,'calctutor-progress'); assert.ok(!JSON.stringify(backup).includes('not exported')); assert.equal(backup.progress.completedLessons.c,true); });
test('backup parsing validates format and version before restoring data', () => { assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(progress)),api.normalizeProgress(progress)); for (const text of ['{}','null','{"format":"calctutor-progress","version":2}','{']) assert.throws(()=>api.parseProgressBackup(text)); });
test('reset removes only the CalcTutor key and reports blocked storage', () => { globalThis.window={}; let removed; globalThis.localStorage={removeItem:key=>removed=key}; assert.equal(api.resetProgress(),true); assert.equal(removed,'calcTutor.progressState'); globalThis.localStorage={removeItem(){throw Error('blocked')}}; assert.equal(api.resetProgress(),false); delete globalThis.window; assert.equal(api.resetProgress(),false); });
test('invalid practice updates never write and valid timestamps are reproducible', () => { globalThis.window={}; let writes=0; globalThis.localStorage={getItem:()=>null,setItem(){writes++}}; for(const slug of ['', ' padded ']) assert.throws(()=>api.markLessonComplete(slug)); assert.throws(()=>api.markLessonComplete('a',false,new Date('bad'))); assert.equal(writes,0); const next=api.markLessonComplete('a',true,new Date('2026-10-26T12:00:00Z')); assert.equal(next.lastPracticed,'2026-10-26T12:00:00.000Z'); assert.equal(writes,1); delete globalThis.window; });

test('normalization is idempotent and backups round trip generated lesson maps without aliasing', () => {
  for(let size=0;size<100;size++) {
    const raw={completedLessons:Object.fromEntries(Array.from({length:size},(_,i)=>['lesson-'+i,i%2===0])),masteredLessons:{extra:true},lastPracticed:'invalid',streakDays:size,secret:'not portable'};
    const normalized=api.normalizeProgress(raw);
    assert.deepEqual(api.normalizeProgress(normalized),normalized);
    const restored=api.parseProgressBackup(api.serializeProgressBackup(normalized));
    assert.deepEqual(restored,normalized);
    assert.equal(api.progressSummary(restored).completed,Math.ceil(size/2)+1);
    restored.completedLessons.changed=true;
    assert.equal(normalized.completedLessons.changed,undefined);
    assert.ok(!api.serializeProgressBackup(raw).includes('not portable'));
  }
});
