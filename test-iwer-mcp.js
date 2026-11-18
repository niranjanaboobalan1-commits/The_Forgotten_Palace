import { spawn } from 'child_process';

const bridgeProc = spawn('node', [
  'C:\\VR_Projects\\dream-hanger\\node_modules\\@iwer\\extension-bridge\\bin\\iwer-bridge.mjs',
  'serve'
], {
  stdio: ['pipe', 'pipe', 'pipe']
});

bridgeProc.stderr.on('data', (d) => {
  console.log('[stderr]', d.toString().trim());
});

let responseData = '';
bridgeProc.stdout.on('data', (d) => {
  responseData += d.toString();
  console.log('[stdout]', d.toString().trim());
});

// Send JSON-RPC initialize request
const initReq = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-client', version: '1.0.0' }
  }
};

const send = (msg) => {
  const json = JSON.stringify(msg);
  bridgeProc.stdin.write(`Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`);
};

setTimeout(() => {
  console.log('Sending initialize...');
  send(initReq);
}, 500);

setTimeout(() => {
  // List tools
  console.log('Listing tools...');
  send({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  });
}, 1500);

setTimeout(() => {
  // Test calling xr_get_session_status
  console.log('Calling xr_get_session_status...');
  send({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'xr_get_session_status',
      arguments: {}
    }
  });
}, 2500);

setTimeout(() => {
  bridgeProc.kill();
  process.exit(0);
}, 4500);
