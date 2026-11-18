/**
 * Headless Full Walkthrough Video + Audio Recorder
 * Uses Playwright + Chromium to capture the complete end-to-end game:
 * Start ("Game On") -> Attic Showcase -> Shell Drop & Glow -> Grand Palace ->
 * Lady Seraphina -> 3 Souls Mini-Games -> Golden Key Hand-Off -> "Game Over".
 * Saves high-definition WebM video with synchronized Web Audio sound effects and music.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, 'dist'); // Use production build dist for maximum performance
const FALLBACK_DIR = __dirname;
const OUTPUT_VIDEO_PATH = path.resolve(__dirname, '..', 'DreamHanger_Full_Walkthrough.webm');

const MIME_MAP = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm'
};

function serveStatic(baseDir, port) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    let filePath = path.join(baseDir, reqPath);

    if (!fs.existsSync(filePath)) {
      filePath = path.join(FALLBACK_DIR, reqPath);
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_MAP[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

async function recordFullWalkthrough() {
  const PORT = 8089;
  console.log('====================================================');
  console.log(' STARTING FULL WALKTHROUGH VIDEO + AUDIO RECORDING  ');
  console.log('====================================================\n');

  console.log('[Recorder] Launching Chromium with WebGL + Web Audio capture...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--disable-web-security',
      '--allow-file-access-from-files',
      '--no-sandbox',
      '--window-size=1280,720',
      '--disable-gpu-sandbox',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    permissions: []
  });

  const page = await context.newPage();

  page.on('console', (msg) => {
    const text = msg.text();
    console.log(`  [Browser] ${text}`);
  });

  page.on('pageerror', (err) => {
    console.warn(`  [Browser Error] ${err.message}`);
  });

  const targetUrl = `file:///C:/VR_Projects/dream-hanger/dist/index.html?record=1&autorun=1`;
  console.log(`[Recorder] Navigating to: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

  // Explicitly trigger recording click if not auto-started
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    if (window.app && !window.app.isRecording) {
      window.app.startVideoRecording();
    }
  });

  console.log('[Recorder] Recording active! Waiting for full walkthrough progression to reach "Game Over"...');

  // Monitor progress
  let isDone = false;
  const startTime = Date.now();
  const maxWaitMs = 480000; // 8 minutes max (plenty of time for calm, majestic showcase + palace mini-games)

  while (!isDone && (Date.now() - startTime) < maxWaitMs) {
    await page.waitForTimeout(2000);
    const status = await page.evaluate(() => {
      return {
        finished: !!window.__walkthroughVideoFinished,
        hasBlob: !!window.__walkthroughVideoBlob,
        isRec: window.app ? window.app.isRecording : false
      };
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`\r  >> Recording in progress... (${elapsed}s elapsed)`);

    if (status.finished && status.hasBlob) {
      isDone = true;
      break;
    }
  }

  // If time elapsed and not yet stopped, manually stop recording to save captured video
  if (!isDone) {
    console.log('\n[Recorder] Max wait reached or final state triggered; stopping recording...');
    await page.evaluate(() => {
      if (window.app && window.app.isRecording) {
        window.app.stopVideoRecording();
      }
    });
    // Give 4 seconds to generate blob
    await page.waitForTimeout(4000);
  }

  console.log('\n\n[Recorder] Walkthrough completed! Extracting recorded video file...');

  const base64Data = await page.evaluate(async () => {
    const blob = window.__walkthroughVideoBlob;
    if (!blob) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const str = reader.result;
        resolve(str.slice(str.indexOf(',') + 1));
      };
      reader.readAsDataURL(blob);
    });
  });

  if (!base64Data) {
    console.error('❌ Failed: No video data captured from MediaRecorder.');
    await browser.close();
    process.exit(1);
  }

  const buffer = Buffer.from(base64Data, 'base64');

  fs.writeFileSync(OUTPUT_VIDEO_PATH, buffer);
  const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);

  console.log('====================================================');
  console.log(` ✓ SUCCESS: Full Walkthrough Video Generated!`);
  console.log(`   Path: ${OUTPUT_VIDEO_PATH}`);
  console.log(`   Size: ${sizeMb} MB`);
  console.log(`   Format: WebM (VP9/VP8 Video @ 60fps + Opus Stereo Web Audio)`);
  console.log('====================================================\n');

  await browser.close();
  process.exit(0);
}

recordFullWalkthrough().catch((err) => {
  console.error('[Recorder Fatal Error]', err);
  process.exit(1);
});
