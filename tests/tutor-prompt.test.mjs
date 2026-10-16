import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpret } from '../lib/tutor/plan.ts';

function readAs(prompt) {
  const result = interpret(prompt);
  assert.ok(!('error' in result), `${prompt}: ${'error' in result ? result.error : ''}`);
  return result.readAs;
}

test('prompt interpreter keeps intent across conversational wrappers', () => {
  assert.match(readAs('Could you please find the roots of x^2 - 5x + 6?'), /Zero of/);
  assert.match(readAs('Where does x^2 - 5x + 6 cross the x-axis?'), /Zero of/);
  assert.match(readAs('What is the highest point of -x^2 + 4x + 3?'), /Maximum of/);
  assert.match(readAs('Could you find the area between z = 1 and z = 2?'), /Area from 1 to 2/);
  assert.match(readAs('Can you get the average of 10, 20, 30, 40?'), /1-Var Stats/);
});

test('prompt interpreter accepts a direct shorthand and preserves a readable interpretation', () => {
  assert.match(readAs('maximum of -x^2 + 4x + 3'), /Maximum of/);
  assert.match(readAs('sin(30°)'), /sin 30 degrees/);
});

test('unsupported text returns a useful prompt instead of claiming universal understanding', () => {
  const result = interpret('help me decide what to eat');
  assert.ok('error' in result);
  assert.match(result.error, /Add an equation or values/);
});
