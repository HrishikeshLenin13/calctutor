import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../lib/progress.ts';
test('restored lesson maps reject unsafe and malformed identifiers',()=>{const raw=JSON.parse('{"completedLessons":{"__proto__":true,"constructor":true," padded ":true,"":true,"limits":true}}');assert.deepEqual(api.normalizeProgress(raw).completedLessons,{limits:true});});
test('explicit save normalizes fields and reports storage failures',()=>{globalThis.window={};let raw;globalThis.localStorage={setItem:(_,value)=>raw=value};const state=api.normalizeProgress({completedLessons:{a:true}});try{assert.equal(api.saveProgress({...state,secret:'omit'}),true);assert.ok(!raw.includes('omit'));globalThis.localStorage={setItem(){throw Error('blocked')}};assert.equal(api.saveProgress(state),false);}finally{delete globalThis.window;delete globalThis.localStorage;}assert.equal(api.saveProgress(state),false);});
