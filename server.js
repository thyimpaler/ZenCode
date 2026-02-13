import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8080;

// Room-based pairing system
// rooms = { "1234": { extension: WebSocket, mobile: WebSocket, createdAt: timestamp } }
const rooms = new Map();

// Temporary unpaired clients waiting for room assignment
const unpaired = {
  extensions: new Map(), // socketId -> { ws, pairingCode, createdAt }
  mobiles: new Map()     // socketId -> { ws, pendingCode: null, createdAt }
};

// Generate 4-digit pairing code
function generatePairingCode() {
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms.has(code));
  return code;
}

// Create HTTP server for serving mobile app
const httpServer = createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    try {
      const html = readFileSync(join(__dirname, '../mobile-app/mobile.html'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (err) {
      res.writeHead(404);
      res.end('Mobile app not found. Ensure mobile-app/mobile.html exists.');
    }
  } else if (req.url === '/health') {
    const stats = {
      status: 'healthy',
      activeRooms: rooms.size,
      unpairedExtensions: unpaired.extensions.size,
      unpairedMobiles: unpaired.mobiles.size,
      rooms: Array.from(rooms.entries()).map(([code, room]) => ({
        code,
        hasExtension: !!room.extension,
        hasMobile: !!room.mobile,
        age: Date.now() - room.createdAt
      }))
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats, null, 2));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Create WebSocket server
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws, req) => {
  const socketId = crypto.randomBytes(8).toString('hex');
  const clientIp = req.socket.remoteAddress;
  
  console.log(`[Connect] New client ${socketId} from ${clientIp}`);

  let clientType = null;
  let pairingCode = null;

  ws.on('message', (rawData) => {
    try {
      const data = JSON.parse(rawData.toString());

      // ============================================================
      // EXTENSION IDENTIFICATION & PAIRING CODE GENERATION
      // ============================================================
      if (data.type === 'identify' && data.clientType === 'extension') {
        clientType = 'extension';
        pairingCode = generatePairingCode();
        
        // Store in unpaired extensions
        unpaired.extensions.set(socketId, {
          ws,
          pairingCode,
          createdAt: Date.now()
        });

        // Create room
        rooms.set(pairingCode, {
          extension: ws,
          mobile: null,
          createdAt: Date.now()
        });

        console.log(`[✓] Extension ${socketId} identified - Pairing Code: ${pairingCode}`);
        
        ws.send(JSON.stringify({
          type: 'pairing_code',
          code: pairingCode
        }));
        
        return;
      }

      // ============================================================
      // MOBILE IDENTIFICATION (WITHOUT CODE)
      // ============================================================
      if (data.type === 'identify' && data.clientType === 'mobile') {
        clientType = 'mobile';
        
        unpaired.mobiles.set(socketId, {
          ws,
          pendingCode: null,
          createdAt: Date.now()
        });

        console.log(`[✓] Mobile ${socketId} identified - awaiting pairing code`);
        
        ws.send(JSON.stringify({
          type: 'identified',
          role: 'mobile'
        }));
        
        return;
      }

      // ============================================================
      // MOBILE SUBMITS PAIRING CODE
      // ============================================================
      if (data.type === 'pair' && clientType === 'mobile') {
        const code = data.code;
        
        if (!rooms.has(code)) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid pairing code'
          }));
          console.log(`[✗] Mobile ${socketId} - Invalid code: ${code}`);
          return;
        }

        const room = rooms.get(code);
        
        if (room.mobile) {
          // Replace existing mobile connection
          console.log(`[Replace] Mobile in room ${code}`);
          try {
            room.mobile.close();
          } catch (err) {
            // Ignore close errors
          }
        }

        room.mobile = ws;
        pairingCode = code;
        unpaired.mobiles.delete(socketId);

        console.log(`[✓] Mobile ${socketId} paired to room ${code}`);

        // Notify mobile of successful pairing
        ws.send(JSON.stringify({
          type: 'paired',
          code: code
        }));

        // Notify extension that mobile joined
        if (room.extension && room.extension.readyState === 1) {
          room.extension.send(JSON.stringify({
            type: 'mobile_connected'
          }));
        }

        return;
      }

      // ============================================================
      // MESSAGE ROUTING (REQUIRES PAIRED STATE)
      // ============================================================
      if (!pairingCode) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Not paired. Please complete pairing first.'
        }));
        return;
      }

      const room = rooms.get(pairingCode);
      if (!room) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Room no longer exists'
        }));
        return;
      }

      // Extension → Mobile (includes streaming chunks)
      if (clientType === 'extension' && room.mobile && room.mobile.readyState === 1) {
        room.mobile.send(JSON.stringify(data));
        
        if (data.type === 'stream_chunk') {
          console.log(`[Stream] Extension → Mobile (${data.chunk?.length || 0} chars)`);
        } else {
          console.log(`[Relay] Extension → Mobile: ${data.type}`);
        }
      }

      // Mobile → Extension
      if (clientType === 'mobile' && room.extension && room.extension.readyState === 1) {
        room.extension.send(JSON.stringify(data));
        console.log(`[Relay] Mobile → Extension: ${data.type}`);
      }

    } catch (err) {
      console.error(`[Error] Failed to parse message from ${socketId}:`, err.message);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid JSON message'
      }));
    }
  });

  ws.on('close', () => {
    console.log(`[Disconnect] Client ${socketId}`);

    // Clean up unpaired clients
    unpaired.extensions.delete(socketId);
    unpaired.mobiles.delete(socketId);

    // Clean up rooms
    if (pairingCode && rooms.has(pairingCode)) {
      const room = rooms.get(pairingCode);
      
      if (clientType === 'extension') {
        // Extension disconnected - notify mobile and clean up room
        if (room.mobile && room.mobile.readyState === 1) {
          room.mobile.send(JSON.stringify({
            type: 'extension_disconnected'
          }));
        }
        rooms.delete(pairingCode);
        console.log(`[Cleanup] Room ${pairingCode} deleted - Extension disconnected`);
      } else if (clientType === 'mobile') {
        // Mobile disconnected - notify extension
        room.mobile = null;
        if (room.extension && room.extension.readyState === 1) {
          room.extension.send(JSON.stringify({
            type: 'mobile_disconnected'
          }));
        }
        console.log(`[Cleanup] Mobile left room ${pairingCode}`);
      }
    }
  });

  ws.on('error', (err) => {
    console.error(`[Error] WebSocket error from ${socketId}:`, err.message);
  });
});

// Cleanup old unpaired clients and empty rooms (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const MAX_AGE = 10 * 60 * 1000; // 10 minutes

  // Clean unpaired extensions
  for (const [id, client] of unpaired.extensions.entries()) {
    if (now - client.createdAt > MAX_AGE) {
      console.log(`[Cleanup] Removing stale unpaired extension ${id}`);
      client.ws.close();
      unpaired.extensions.delete(id);
    }
  }

  // Clean unpaired mobiles
  for (const [id, client] of unpaired.mobiles.entries()) {
    if (now - client.createdAt > MAX_AGE) {
      console.log(`[Cleanup] Removing stale unpaired mobile ${id}`);
      client.ws.close();
      unpaired.mobiles.delete(id);
    }
  }

  // Clean empty or old rooms
  for (const [code, room] of rooms.entries()) {
    if (now - room.createdAt > MAX_AGE * 2) { // 20 minutes
      console.log(`[Cleanup] Removing old room ${code}`);
      if (room.extension) room.extension.close();
      if (room.mobile) room.mobile.close();
      rooms.delete(code);
    }
  }
}, 5 * 60 * 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Shutdown] Closing all connections...');
  
  // Close all rooms
  for (const [code, room] of rooms.entries()) {
    if (room.extension) room.extension.close();
    if (room.mobile) room.mobile.close();
  }
  
  // Close unpaired clients
  for (const client of unpaired.extensions.values()) {
    client.ws.close();
  }
  for (const client of unpaired.mobiles.values()) {
    client.ws.close();
  }

  httpServer.close(() => {
    console.log('[Shutdown] Server closed');
    process.exit(0);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║       AuraCode Relay Server          ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log('');
  console.log(`  HTTP:      http://localhost:${PORT}`);
  console.log(`  WebSocket: ws://localhost:${PORT}`);
  console.log('');
  console.log('  Mobile App: Open browser to HTTP URL');
  console.log('  Status:     GET /health');
  console.log('  Pairing:    4-digit code system');
  console.log('');
  console.log('  Press Ctrl+C to stop');
  console.log('');
});
