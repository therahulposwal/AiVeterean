import test from 'node:test';
import assert from 'node:assert/strict';
import { getRouteAuthAction } from '../lib/route-auth.js';

test('protected routes redirect to login when token is missing', () => {
  assert.equal(getRouteAuthAction('/dashboard/profile', false), 'redirect_login');
  assert.equal(getRouteAuthAction('/dashboard/resumes', false), 'redirect_login');
  assert.equal(getRouteAuthAction('/interview', false), 'redirect_login');
});

test('public auth pages are always allowed', () => {
  assert.equal(getRouteAuthAction('/login', true), 'allow');
  assert.equal(getRouteAuthAction('/register', true), 'allow');
  assert.equal(getRouteAuthAction('/login', false), 'allow');
  assert.equal(getRouteAuthAction('/register', false), 'allow');
});

test('normal pages are allowed', () => {
  assert.equal(getRouteAuthAction('/', false), 'allow');
  assert.equal(getRouteAuthAction('/dashboard/profile', true), 'allow');
  assert.equal(getRouteAuthAction('/interview', true), 'allow');
});
