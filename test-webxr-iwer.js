/**
 * Automated WebXR Scene Test via @iwer/extension-bridge
 * Connects to the local bridge and drives the 11-step attic scene.
 */

import { WebSocket } from 'ws';

const WS_URL = 'ws://127.0.0.1:8723/__iwer_mcp';

console.log('[TestRunner] Connecting to IWER Extension Bridge at ' + WS_URL);

let ws;
let msgId = 100;
const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const req = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };
    pending.set(id, { resolve, reject, method });
    ws.send(JSON.stringify(req));
  });
}

function callTool(name, args = {}) {
  return send('tools/call', {
    name,
    arguments: args
  }).then((res) => {
    if (res.isError) {
      const errText = res.content?.[0]?.text || JSON.stringify(res);
      throw new Error(errText);
    }
    return res;
  });
}

async function run() {
  ws = new WebSocket(WS_URL);

  ws.on('open', async () => {
    console.log('[TestRunner] Connected to bridge WebSocket.');

    // Listen for responses
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        }
      } catch (e) {
        console.error('[TestRunner] Parse error:', e);
      }
    });

    console.log('[TestRunner] Waiting for tab consent and readiness...');
  });

  ws.on('error', (err) => {
    console.error('[TestRunner] WS Error:', err.message);
  });
}

run().catch(console.error);
