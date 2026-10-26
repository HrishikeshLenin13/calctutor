import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../lib/progress.ts';
const progress={completedLessons:{a:true,b:false},masteredLessons:{a:true,c:true},lastPracticed:null,streakDays:2};
test('summary counts boolean completion and includes mastery without duplicates', () => { assert.deepEqual(api.progressSummary(progress),{completed:2,mastered:2,lastPracticed:null,streakDays:2}); });
