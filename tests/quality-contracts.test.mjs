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

test("lesson-id-roundtrip-5", () => {
const input=api.normalizeProgress({completedLessons:{["\u5b66\u7fd2"]:true},masteredLessons:{["\u5b66\u7fd2"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"\u5b66\u7fd2").completedLessons,{});assert.equal(input.completedLessons["\u5b66\u7fd2"],true);
});

test("lesson-id-roundtrip-6", () => {
const input=api.normalizeProgress({completedLessons:{["\ud83d\udcda"]:true},masteredLessons:{["\ud83d\udcda"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"\ud83d\udcda").completedLessons,{});assert.equal(input.completedLessons["\ud83d\udcda"],true);
});

test("lesson-id-roundtrip-7", () => {
const input=api.normalizeProgress({completedLessons:{["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]:true},masteredLessons:{["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa").completedLessons,{});assert.equal(input.completedLessons["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],true);
});

test("lesson-id-roundtrip-8", () => {
const input=api.normalizeProgress({completedLessons:{["a.b"]:true},masteredLessons:{["a.b"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"a.b").completedLessons,{});assert.equal(input.completedLessons["a.b"],true);
});

test("lesson-id-roundtrip-9", () => {
const input=api.normalizeProgress({completedLessons:{["a-b"]:true},masteredLessons:{["a-b"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"a-b").completedLessons,{});assert.equal(input.completedLessons["a-b"],true);
});

test("lesson-id-roundtrip-10", () => {
const input=api.normalizeProgress({completedLessons:{["a_b"]:true},masteredLessons:{["a_b"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"a_b").completedLessons,{});assert.equal(input.completedLessons["a_b"],true);
});

test("lesson-id-roundtrip-11", () => {
const input=api.normalizeProgress({completedLessons:{["A"]:true},masteredLessons:{["A"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"A").completedLessons,{});assert.equal(input.completedLessons["A"],true);
});

test("lesson-id-roundtrip-12", () => {
const input=api.normalizeProgress({completedLessons:{["0"]:true},masteredLessons:{["0"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"0").completedLessons,{});assert.equal(input.completedLessons["0"],true);
});

test("lesson-id-roundtrip-13", () => {
const input=api.normalizeProgress({completedLessons:{["x:one"]:true},masteredLessons:{["x:one"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"x:one").completedLessons,{});assert.equal(input.completedLessons["x:one"],true);
});

test("lesson-id-roundtrip-14", () => {
const input=api.normalizeProgress({completedLessons:{["x#one"]:true},masteredLessons:{["x#one"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"x#one").completedLessons,{});assert.equal(input.completedLessons["x#one"],true);
});

test("lesson-id-roundtrip-15", () => {
const input=api.normalizeProgress({completedLessons:{["x?one"]:true},masteredLessons:{["x?one"]:true},streakDays:2});const restored=api.parseProgressBackup(api.serializeProgressBackup(input));assert.deepEqual(restored,input);assert.deepEqual(api.progressSummary(restored),{completed:1,mastered:1,lastPracticed:null,streakDays:2});assert.deepEqual(api.withoutLessonProgress(restored,"x?one").completedLessons,{});assert.equal(input.completedLessons["x?one"],true);
});

test("rejected-lesson-key-1", () => {
const flags=Object.fromEntries([["",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-2", () => {
const flags=Object.fromEntries([[" ",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-3", () => {
const flags=Object.fromEntries([["\t",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-4", () => {
const flags=Object.fromEntries([["\n",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-5", () => {
const flags=Object.fromEntries([[" x",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-6", () => {
const flags=Object.fromEntries([["x ",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-7", () => {
const flags=Object.fromEntries([["\tx",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-8", () => {
const flags=Object.fromEntries([["x\n",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-9", () => {
const flags=Object.fromEntries([["\u00a0x",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-10", () => {
const flags=Object.fromEntries([["x\u00a0",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-11", () => {
const flags=Object.fromEntries([["__proto__",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-12", () => {
const flags=Object.fromEntries([["constructor",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-13", () => {
const flags=Object.fromEntries([["prototype",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-14", () => {
const flags=Object.fromEntries([["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("rejected-lesson-key-15", () => {
const flags=Object.fromEntries([["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",true],['valid',true]]);const normalized=api.normalizeProgress({completedLessons:flags,masteredLessons:flags});assert.deepEqual(Object.keys(normalized.completedLessons),['valid']);assert.deepEqual(Object.keys(normalized.masteredLessons),['valid']);assert.equal(api.progressSummary(normalized).completed,1);
});

test("backup-envelope-rejection-1", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"null"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-2", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"[]"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-3", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"0"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-4", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"true"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-5", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"{}"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-6", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"{\"format\":\"wrong\",\"version\":1,\"progress\":{}}"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-7", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"{\"format\":\"calctutor-progress\",\"version\":0,\"progress\":{}}"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-8", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"{\"format\":\"calctutor-progress\",\"version\":2,\"progress\":{}}"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-9", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"{\"format\":\"calctutor-progress\",\"version\":\"1\",\"progress\":{}}"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-10", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"{\"format\":\"calctutor-progress\",\"version\":true,\"progress\":{}}"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-11", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"{\"format\":\"calctutor-progress\",\"version\":1}"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-12", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"{\"format\":\"calctutor-progress\",\"version\":1,\"progress\":null}"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-13", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"{\"format\":\"calctutor-progress\",\"version\":1,\"progress\":[]}"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-14", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"{\"format\":\"calctutor-progress\",\"version\":1,\"progress\":\"x\"}"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("backup-envelope-rejection-15", () => {
const before=api.normalizeProgress({completedLessons:{keep:true}});assert.throws(()=>api.previewProgressImport(before,"{invalid"));assert.deepEqual(before.completedLessons,{keep:true});
});

test("invalid-streak-normalizes-negative", () => {
const p=api.normalizeProgress({streakDays:-1,masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-zero", () => {
const p=api.normalizeProgress({streakDays:0,masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-fractional", () => {
const p=api.normalizeProgress({streakDays:.5,masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-nan", () => {
const p=api.normalizeProgress({streakDays:NaN,masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-infinity", () => {
const p=api.normalizeProgress({streakDays:Infinity,masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-negative-infinity", () => {
const p=api.normalizeProgress({streakDays:-Infinity,masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-text", () => {
const p=api.normalizeProgress({streakDays:'2',masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-null", () => {
const p=api.normalizeProgress({streakDays:null,masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-bool", () => {
const p=api.normalizeProgress({streakDays:true,masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-array", () => {
const p=api.normalizeProgress({streakDays:[],masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-object", () => {
const p=api.normalizeProgress({streakDays:{},masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-undefined", () => {
const p=api.normalizeProgress({streakDays:undefined,masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});

test("invalid-streak-normalizes-unsafe", () => {
const p=api.normalizeProgress({streakDays:Number.MAX_SAFE_INTEGER+1,masteredLessons:{a:true},completedLessons:{a:false}});assert.equal(p.streakDays,1);assert.equal(p.completedLessons.a,true);assert.deepEqual(api.parseProgressBackup(api.serializeProgressBackup(p)),p);
});
