import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpret, rehearsal, screenNote } from '../lib/tutor/plan.ts';

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

test('calculus prompts survive varied wording and produce executable TI key sequences', () => {
  for (const prompt of [
    'Can you calculate the derivative of x^2 at x=3?',
    'find the derivative of x squared when x is 3',
    'differentiate x^2 at 3 please',
    'what is the slope of x^2 at x equals 3',
  ]) {
    const result = interpret(prompt);
    assert.ok(!('error' in result), `${prompt}: ${'error' in result ? result.error : ''}`);
    assert.match(result.readAs, /Derivative of .*x = 3/);
    assert.match(result.steps[1].keys.map((key) => key.id).join(','), /math,n4/);
    if (prompt.includes('x^2 at x=3')) assert.match(screenNote(rehearsal(result)), /6/);
  }

  for (const prompt of [
    'What is the integral of 2x from 0 to 3?',
    'integrate 2x between 0 and 3',
    'please find the definite integral of 2*x from 0 to 3',
  ]) {
    const result = interpret(prompt);
    assert.ok(!('error' in result), `${prompt}: ${'error' in result ? result.error : ''}`);
    assert.match(result.readAs, /Integral of .* from 0 to 3/);
    assert.match(result.steps[1].keys.map((key) => key.id).join(','), /math,n5/);
    if (prompt.includes('from 0 to 3')) assert.match(screenNote(rehearsal(result)), /9/);
  }
});

test('explicit solve prompts use the calculator solver instead of being mislabeled as zeros', () => {
  for (const prompt of ['please solve 2x + 3 = 11', 'find the solution to 2x+3 equals 11']) {
    const result = interpret(prompt);
    assert.ok(!('error' in result), `${prompt}: ${'error' in result ? result.error : ''}`);
    assert.match(result.readAs, /^Solve/);
    assert.equal(result.steps[1].keys[0].id, 'math');
    assert.equal(result.steps[1].keys[1].id, 'n6');
    if (prompt.startsWith('please solve')) assert.match(screenNote(rehearsal(result)), /4/);
  }
});

test('unsupported text returns a useful prompt instead of claiming universal understanding', () => {
  const result = interpret('help me decide what to eat');
  assert.ok('error' in result);
  assert.match(result.error, /Add an equation or values/);
});
