import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyEnv, evaluate, linReg, normalCdf, oneVarStats } from '../lib/calculator/engine.ts';

test('calculator arithmetic respects TI expression evaluation', () => {
  assert.equal(evaluate('2+2', emptyEnv()), 4);
  assert.equal(evaluate('2^3^2', emptyEnv()), 512);
  assert.equal(evaluate('sqrt(144)', emptyEnv()), 12);
});

test('normal distribution and one-variable statistics return useful values', () => {
  assert.ok(Math.abs(normalCdf(0) - 0.5) < 2e-7);
  assert.ok(Math.abs(normalCdf(1.959963984540054) - 0.975) < 1e-6);
  const stats = oneVarStats([2, 4, 6]);
  assert.equal(stats.n, 3);
  assert.equal(stats.mean, 4);
  assert.equal(stats.sum, 12);
  assert.equal(stats.sx, 2);
});

test('linear regression fits a straight-line data set', () => {
  const fit = linReg([1, 2, 3], [3, 5, 7]);
  assert.ok(Math.abs(fit.intercept - 1) < 1e-12);
  assert.ok(Math.abs(fit.slope - 2) < 1e-12);
  assert.equal(fit.r, 1);
});
