import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const assets = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/styles.css', ['styles.css', 'text/css']],
  ['/src/main.mjs', ['src/main.mjs', 'text/javascript']],
  ['/src/app.mjs', ['src/app.mjs', 'text/javascript']],
  ['/src/tasks.mjs', ['src/tasks.mjs', 'text/javascript']],
]);

export function createStaticServer() {
  return createServer(async (request, response) => {
    let asset;
    try {
      asset = assets.get(new URL(request.url, 'http://localhost').pathname);
    } catch {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Bad request');
      return;
    }
    if (!asset) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    try {
      const content = await readFile(new URL(`../${asset[0]}`, import.meta.url));
      response.writeHead(200, {
        'Content-Type': `${asset[1]}; charset=utf-8`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      });
      response.end(content);
    } catch {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Could not read local asset');
    }
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createStaticServer();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(4173, '127.0.0.1', () => console.log('Task board: http://127.0.0.1:4173 (Ctrl+C to stop)'));
}
