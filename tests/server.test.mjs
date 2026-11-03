import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { get } from 'node:http';
import { createStaticServer } from '../scripts/serve.mjs';

test('serves UI and ES modules locally with correct types; rejects unknown files', async t => {
  const server = createStaticServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const [path, type] of [['/', 'text/html'], ['/styles.css', 'text/css'], ['/src/main.mjs', 'text/javascript'], ['/src/app.mjs', 'text/javascript'], ['/src/tasks.mjs', 'text/javascript']]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get('content-type').startsWith(type));
    assert.ok((await response.text()).length > 0);
  }
  assert.equal((await fetch(base + '/package.json')).status, 404);
  assert.equal((await fetch(base + '/missing')).status, 404);
});

test('malformed request target returns HTTP 400 without crashing the server', { timeout: 10_000 }, async t => {
  // Isolate the real listener so an uncaught rejection cannot kill the test runner.
  const moduleUrl = new URL('../scripts/serve.mjs', import.meta.url).href;
  const child = spawn(process.execPath, ['--input-type=module', '--eval', `
    import { createStaticServer } from ${JSON.stringify(moduleUrl)};
    const server = createStaticServer();
    server.listen(0, '127.0.0.1', () => process.send(server.address().port));
  `, 'task-board-test'], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  let stderr = '';
  child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
  const exited = once(child, 'exit');
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill();
    await exited;
  });
  const [port] = await Promise.race([
    once(child, 'message'),
    exited.then(() => { throw new Error(`Server exited before listening: ${stderr}`); }),
  ]);

  // Use an explicit request path: fetch would parse/normalize the malformed URL.
  const status = await new Promise((resolve, reject) => {
    const request = get({ hostname: '127.0.0.1', port, path: '//[', agent: false }, response => {
      response.resume();
      response.on('error', reject);
      response.on('end', () => resolve(response.statusCode));
    });
    request.on('error', error => reject(new Error(`Expected HTTP 400, got ${error.message}\n${stderr}`, { cause: error })));
    request.setTimeout(2_000, () => request.destroy(new Error('Request timed out')));
  });
  assert.equal(status, 400);
  const response = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(response.status, 200);
  assert.ok((await response.text()).length > 0);
  assert.equal(child.exitCode, null);
  assert.equal(child.signalCode, null);
});
