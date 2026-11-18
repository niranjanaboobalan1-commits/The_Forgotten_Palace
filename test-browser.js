import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const baseDir = 'C:\\VR_Projects\\dream-hanger';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(baseDir, reqPath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found: ' + reqPath);
    return;
  }

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8099, '127.0.0.1', () => {
  console.log('Test server listening on port 8099');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const args = [
    '--headless=new',
    '--enable-logging=stderr',
    '--v=1',
    '--virtual-time-budget=4000',
    'http://127.0.0.1:8099/index.html'
  ];

  const proc = spawn(chromePath, args);
  let stderr = '';
  let stdout = '';

  proc.stdout.on('data', (d) => { stdout += d.toString(); });
  proc.stderr.on('data', (d) => { stderr += d.toString(); });

  proc.on('close', (code) => {
    console.log('Chrome exit code:', code);
    console.log('--- STDOUT ---');
    console.log(stdout);
    console.log('--- STDERR (Console logs) ---');
    console.log(stderr);
    server.close();
    process.exit(0);
  });
});

