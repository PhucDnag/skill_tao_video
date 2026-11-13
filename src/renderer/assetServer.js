const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// Private, ephemeral asset transport for the headless renderer; no studio/API.
function startServer(port = 0) {
  const root = path.resolve(__dirname, 'assets');
  const vendor = path.dirname(require.resolve('three'));
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end(); return; }
    const isVendor = pathname.startsWith('/vendor/three/');
    const base = isVendor ? vendor : root;
    const file = path.resolve(base, '.' + (isVendor ? pathname.slice('/vendor/three'.length) : pathname));
    if (!['GET', 'HEAD'].includes(req.method) || (file !== base && !file.startsWith(base + path.sep))) {
      res.writeHead(403).end(); return;
    }
    fs.stat(file, (err, stat) => {
      if (err || !stat.isFile()) { res.writeHead(404).end(); return; }
      res.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'})[path.extname(file)] || 'application/octet-stream');
      if (req.method === 'HEAD') res.end();
      else fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}
module.exports = { startServer };
