import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

async function loadModule(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React } });
  const resolved = outputText.replace(/from ['"]react['"]/g, `from '${import.meta.resolve('react')}'`);
  return import(`data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}#${Math.random()}`);
}

function setup() {
  const saved = new Map([['sem_token', 'old-access'], ['sem_refresh_token', 'refresh']]);
  globalThis.sessionStorage = { getItem: key => saved.get(key) ?? null, setItem: (k, v) => saved.set(k, v), removeItem: k => saved.delete(k) };
  globalThis.window = Object.assign(new EventTarget(), { location: { search: '' } });
  return saved;
}

test('concurrent 401s share refresh and keep the original write idempotency key', async () => {
  setup();
  const api = await loadModule('../src/services/api.ts');
  let refreshCount = 0;
  const writes = [];
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/auth/refresh')) {
      refreshCount++;
      await new Promise(resolve => setTimeout(resolve, 10));
      return Response.json({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    }
    const headers = new Headers(options.headers);
    writes.push({ url, key: headers.get('Idempotency-Key'), auth: headers.get('Authorization') });
    return headers.get('Authorization') === 'Bearer old-access'
      ? new Response('', { status: 401 }) : Response.json({ id: 1 });
  };
  await Promise.all([api.request('/expenses', { method: 'POST', body: '{}' }), api.request('/budgets', { method: 'POST', body: '{}' })]);
  assert.equal(refreshCount, 1);
  for (const path of ['/api/v1/expenses', '/api/v1/budgets']) {
    const matching = writes.filter(w => w.url === path);
    assert.equal(matching.length, 2);
    assert.ok(matching[0].key);
    assert.equal(matching[0].key, matching[1].key);
  }
});

test('bad login shows the API message without refreshing or erasing another session', async () => {
  const saved = setup();
  const api = await loadModule('../src/services/api.ts');
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls++;
    assert.equal(new Headers(options.headers).has('Authorization'), false);
    return Response.json({ message: 'Invalid email or password' }, { status: 401 });
  };
  await assert.rejects(api.request('/auth/login', { method: 'POST', body: '{}' }), { message: 'Invalid email or password', status: 401 });
  assert.equal(calls, 1);
  assert.equal(saved.get('sem_token'), 'old-access');
});

test('logout during refresh cannot restore credentials', async () => {
  const saved = setup();
  const api = await loadModule('../src/services/api.ts');
  globalThis.fetch = async url => {
    if (url.endsWith('/auth/refresh')) {
      api.clearSession();
      return Response.json({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    }
    return new Response('', { status: 401 });
  };
  await assert.rejects(api.request('/expenses'), { status: 401 });
  assert.equal(saved.has('sem_token'), false);
});

test('demo does not issue any live API calls', async () => {
  setup();
  window.location.search = '?demo=1';
  const api = await loadModule('../src/services/api.ts');
  globalThis.fetch = () => { throw new Error('Unexpected live call'); };
  assert.equal((await api.request('/expenses')).length, 6);
});

test('a stale refresh failure does not erase a newly signed-in account', async () => {
  const saved = setup();
  const api = await loadModule('../src/services/api.ts');
  globalThis.fetch = async url => {
    if (url.endsWith('/auth/refresh')) {
      saved.set('sem_token', 'other-account');
      saved.set('sem_refresh_token', 'other-refresh');
      return new Response('', { status: 403 });
    }
    return new Response('', { status: 401 });
  };
  await assert.rejects(api.request('/expenses'), { status: 409 });
  assert.equal(saved.get('sem_token'), 'other-account');
});

test('sign-out clears locally and attempts revocation with the original token only in live mode', async () => {
  const saved = setup();
  const api = await loadModule('../src/services/api.ts');
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, auth: new Headers(options.headers).get('Authorization') });
    return new Response('', { status: 200 });
  };
  api.endSession();
  assert.equal(saved.has('sem_token'), false);
  assert.deepEqual(calls, [{ url: '/api/v1/auth/logout', auth: 'Bearer old-access' }]);
  saved.set('sem_token', 'demo-access');
  window.location.search = '?demo=1';
  api.endSession();
  assert.equal(saved.has('sem_token'), false);
  assert.equal(calls.length, 1);
});

test('CSV quotes user text and neutralizes formulas', async () => {
  const { encodeCsv } = await loadModule('../src/lib/csv.ts');
  assert.equal(encodeCsv([['=HYPERLINK("https://example.com")', '  +SUM(1,2)', 'Lunch, cafe', '12.50']]),
    '"\'=HYPERLINK(""https://example.com"")","\'  +SUM(1,2)","Lunch, cafe","12.50"');
});

test('AI inline formatting renders HTML payloads as text', async () => {
  const { InlineText } = await loadModule('../src/components/ui/InlineText.tsx');
  const html = renderToStaticMarkup(React.createElement(InlineText, { text: '**Total** <img src=x onerror=alert(1)>' }));
  assert.ok(html.includes('<strong>Total</strong>'));
  assert.ok(html.includes('&lt;img'));
  assert.equal(html.includes('<img'), false);
});
