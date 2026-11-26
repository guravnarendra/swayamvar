import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// Ensure .env is always loaded regardless of current working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  // Fast heartbeat to instantly clean up refreshed tabs
  pingInterval: 3000,
  pingTimeout: 4000,
});

// Track unique devices to prevent duplicate counts on fast page refresh
// deviceId -> socketId
const connectedDevices = new Map();

const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let db = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      realtime: { transport: ws },
    });
    console.log(`✓ Supabase client configured for: ${SUPABASE_URL}`);
  } catch (err) {
    console.error('⚠ Supabase init error:', err.message);
  }
} else {
  console.warn('⚠ SUPABASE_URL or SUPABASE_ANON_KEY missing in .env');
}

// In-memory room storage: roomCode -> roomState
const rooms = new Map();

function generate4DigitCode() {
  let code;
  let attempts = 0;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    attempts++;
  } while (rooms.has(code) && attempts < 100);
  return code;
}

function createFreshRoomState(roomCode) {
  return {
    roomCode: (roomCode || '1995').toUpperCase(),
    sessionId: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    phase: 'cover', // cover -> lobby -> gallery -> voting -> results -> finale
    roundIndex: 0,
    galleryIndex: 0,
    players: {}, // { [playerId]: { id, name, displayName, color, gender, titleEmoji, titleAction, titleImg } }
    votes: {},   // { [roundId]: { [playerId]: suitorId } }
    countdownStartedAt: null,
    lastActivityAt: Date.now(),
  };
}

// Retrieve room from memory or load from Supabase if previously persisted.
// Returns null if the room does not exist anywhere (PREVENTS auto-creation on invalid URL/input).
async function getRoom(roomCode) {
  if (!roomCode) return null;
  const code = roomCode.toString().trim().toUpperCase();
  if (rooms.has(code)) {
    return rooms.get(code);
  }
  // Try to load from Supabase if already saved
  if (db) {
    try {
      const { data, error } = await db.from('games').select('state').eq('room_code', `shaadi-${code}`).single();
      if (data?.state) {
        rooms.set(code, data.state);
        console.log(`[DB] Restored room ${code} state from Supabase`);
        return rooms.get(code);
      }
    } catch (_e) {}
  }
  return null;
}

// Persist room state to Supabase asynchronously with comprehensive logging
async function persistRoomState(roomState) {
  if (!db) {
    console.warn('[DB] Supabase client is not connected; state cannot be saved.');
    return;
  }
  try {
    const gameKey = `shaadi-${roomState.roomCode}`;
    const payload = {
      room_code: gameKey,
      state: roomState,
      updated_at: new Date().toISOString(),
    };

    const { error } = await db.from('games').upsert(payload);

    if (error) {
      console.error(`❌ [DB Error] Failed to persist room ${roomState.roomCode}:`, error.message);
      if (error.code === 'PGRST205') {
        console.error(`👉 [DB Action Required] Table 'public.games' does not exist in your Supabase project (${SUPABASE_URL})!`);
        console.error(`   Please run the following SQL in your Supabase SQL Editor:`);
        console.error(`   CREATE TABLE public.games ( room_code TEXT PRIMARY KEY, state JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW() );`);
        console.error(`   ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;`);
        console.error(`   CREATE POLICY "Allow public all" ON public.games FOR ALL TO anon USING (true) WITH CHECK (true);`);
      }
    } else {
      console.log(`✅ [DB Success] Room ${roomState.roomCode} saved to Supabase (Phase: ${roomState.phase}, Players: ${Object.keys(roomState.players || {}).length}, Votes: ${Object.keys(roomState.votes || {}).length})`);
    }
  } catch (err) {
    console.error('❌ [DB Exception]:', err.message);
  }
}

// Debounce Supabase writes per room so spamming joins/votes doesn't flood the DB
const persistTimers = new Map();
function schedulePersistRoomState(roomState) {
  if (!roomState || !roomState.roomCode) return;
  const code = roomState.roomCode;
  if (persistTimers.has(code)) {
    clearTimeout(persistTimers.get(code));
  }
  const timer = setTimeout(() => {
    persistTimers.delete(code);
    persistRoomState(roomState);
  }, 400);
  persistTimers.set(code, timer);
}

// Persist individual vote to the 'votes' table (one clean row per vote)
async function persistIndividualVote(roomCode, playerId, playerName, roundId, suitorId) {
  if (!db) return;
  try {
    const gameKey = `shaadi-${roomCode}`;
    const payload = {
      room_code: gameKey,
      player_id: playerId,
      player_name: playerName || 'Guest',
      question_id: roundId,
      vote: suitorId,
      created_at: new Date().toISOString(),
    };

    const { error } = await db.from('votes').upsert(payload, {
      onConflict: 'room_code,player_id,question_id',
    });

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn(`👉 [DB Hint] 'votes' table not created yet in Supabase. Run supabase-schema.sql to store individual rows!`);
      } else {
        console.error(`❌ [DB Vote Error]:`, error.message);
      }
    } else {
      console.log(`🗳️ [DB Vote Row Saved] Table 'votes' -> ${playerName || playerId} locked '${suitorId}' for '${roundId}' (Room: ${roomCode})`);
    }
  } catch (err) {
    console.error('❌ [DB Vote Exception]:', err.message);
  }
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
}

function getServerStats() {
  const mem = process.memoryUsage();
  const renderLimitBytes = 512 * 1024 * 1024; // 512MB Render free tier
  const rssMB = Number((mem.rss / 1024 / 1024).toFixed(1));
  const heapUsedMB = Number((mem.heapUsed / 1024 / 1024).toFixed(1));
  const heapTotalMB = Number((mem.heapTotal / 1024 / 1024).toFixed(1));
  const memoryPercent = Number(((mem.rss / renderLimitBytes) * 100).toFixed(1));

  const roomDetails = [];
  rooms.forEach((r, code) => {
    const roundIds = ['marry', 'date', 'mum', 'emergency'];
    const currentRoundId = roundIds[r.roundIndex || 0] || 'marry';
    roomDetails.push({
      roomCode: code,
      phase: r.phase,
      roundIndex: r.roundIndex,
      playersCount: Object.keys(r.players || {}).length,
      votesCount: Object.keys(r.votes?.[currentRoundId] || {}).length,
      lastActivityAgo: Math.round((Date.now() - (r.lastActivityAt || Date.now())) / 1000) + 's ago',
    });
  });

  return {
    timestamp: new Date().toISOString(),
    uptime: formatUptime(process.uptime()),
    uptimeSeconds: Math.floor(process.uptime()),
    renderCapacity: {
      allocatedRAM: '512 MB',
      currentUsageRAM: `${rssMB} MB`,
      ramUsedPercent: `${memoryPercent}%`,
      heapUsed: `${heapUsedMB} MB`,
      heapTotal: `${heapTotalMB} MB`,
      status: memoryPercent > 80 ? 'HIGH_LOAD' : memoryPercent > 50 ? 'MODERATE' : 'OPTIMAL',
    },
    traffic: {
      activeSockets: io?.engine?.clientsCount || 0,
      uniqueDevices: connectedDevices.size,
      activeRooms: rooms.size,
      totalPlayersConnected: Array.from(rooms.values()).reduce((sum, r) => sum + Object.keys(r.players || {}).length, 0),
    },
    database: {
      connected: Boolean(db),
      url: SUPABASE_URL,
    },
    rooms: roomDetails,
  };
}

// REST Endpoints
app.get('/health', async (req, res) => {
  let dbHealthy = false;
  let dbLatencyMs = null;
  if (db) {
    const start = Date.now();
    try {
      const { error } = await db.from('games').select('room_code').limit(1);
      dbHealthy = !error;
      dbLatencyMs = Date.now() - start;
    } catch (_e) {}
  }

  const mem = process.memoryUsage();
  res.json({
    status: 'ok',
    uptime: formatUptime(process.uptime()),
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    activeSockets: io?.engine?.clientsCount || 0,
    activeRooms: rooms.size,
    memoryUsageMB: (mem.rss / 1024 / 1024).toFixed(1) + ' MB / 512 MB',
    database: {
      connected: Boolean(db),
      healthy: dbHealthy,
      latencyMs: dbLatencyMs,
      url: SUPABASE_URL,
    },
  });
});

app.get('/api/stats', (req, res) => {
  res.json(getServerStats());
});

// Endpoint to create a room with 4-digit code
app.post('/api/create-room', async (req, res) => {
  const roomCode = generate4DigitCode();
  const room = createFreshRoomState(roomCode);
  room.phase = 'lobby';
  rooms.set(roomCode, room);
  await persistRoomState(room);
  console.log(`[Room Created] Room Code: ${roomCode}`);
  res.json({ roomCode, room });
});

// Endpoint to check room status
app.get('/api/check-room/:code', async (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const room = await getRoom(code);
  if (!room) {
    return res.json({ exists: false, roomCode: code });
  }
  res.json({ exists: true, roomCode: code, phase: room.phase });
});

// REST Endpoint to completely delete a specific room and all its votes
app.delete('/api/room/:code', async (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'Room code required' });

  if (db) {
    try {
      await db.from('votes').delete().eq('room_code', `shaadi-${code}`);
      await db.from('games').delete().eq('room_code', `shaadi-${code}`);
    } catch (_e) {}
  }
  rooms.delete(code);
  io.to(code).emit('room_deleted', { roomCode: code });
  console.log(`🗑️ [Room Wiped via API] Room ${code} and its database rows deleted`);
  res.json({ success: true, deletedRoom: code });
});

// REST Endpoint to wipe all game data and votes completely from Supabase (/stats control)
app.post('/api/wipe-database', async (req, res) => {
  if (db) {
    try {
      await db.from('votes').delete().neq('id', 0);
    } catch (_e) {}
    try {
      await db.from('games').delete().neq('room_code', '');
    } catch (_e) {}
  }

  // Notify any connected clients to reset
  for (const code of rooms.keys()) {
    io.to(code).emit('room_deleted', { roomCode: code });
  }
  rooms.clear();

  console.log('🧹 [DB Wipe Complete] All rooms and votes wiped from Supabase and memory via /stats');
  res.json({ success: true, message: 'All rooms and votes wiped cleanly' });
});

io.on('connection', (socket) => {
  const deviceId = socket.handshake.auth?.deviceId || socket.id;

  // If this device was already connected on an older socket (e.g. from page refresh),
  // immediately disconnect the old stale socket so counts never inflate!
  if (connectedDevices.has(deviceId)) {
    const oldSocketId = connectedDevices.get(deviceId);
    if (oldSocketId !== socket.id) {
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        try { oldSocket.disconnect(true); } catch (_e) {}
      }
    }
  }
  connectedDevices.set(deviceId, socket.id);

  let currentRoom = null;
  let currentUserRole = null;
  let currentUserId = null;

  // Create room event from client
  socket.on('create_room', async ({ hostId }, callback) => {
    const roomCode = generate4DigitCode();
    const room = createFreshRoomState(roomCode);
    room.phase = 'lobby';
    rooms.set(roomCode, room);
    await persistRoomState(room);

    socket.join(roomCode);
    currentRoom = roomCode;
    currentUserRole = 'host';
    currentUserId = hostId;

    console.log(`[Host] Created room ${roomCode}`);
    if (typeof callback === 'function') {
      callback({ roomCode, room });
    }
    socket.emit('state_update', room);
  });

  socket.on('join_room', async ({ roomCode, role, playerId }) => {
    const code = (roomCode || '').toString().trim().toUpperCase();
    if (!code) {
      socket.emit('room_not_found', { roomCode: code, message: 'Invalid room code' });
      return;
    }

    const room = await getRoom(code);
    if (!room) {
      console.log(`[Socket] Room "${code}" does not exist in DB or memory. Rejecting ${role || 'user'}`);
      socket.emit('room_not_found', {
        roomCode: code,
        message: `Room ${code} does not exist. Redirecting to home...`,
      });
      return;
    }

    currentRoom = code;
    currentUserRole = role || 'player';
    currentUserId = playerId;

    socket.join(code);
    socket.emit('state_update', room);
    console.log(`[Socket] ${role} ${playerId || socket.id} joined room ${code}`);
  });

  // Host: Open lobby from cover screen
  socket.on('host_open_lobby', async ({ roomCode }) => {
    const room = await getRoom(roomCode || currentRoom);
    if (!room) return socket.emit('room_not_found', { roomCode: roomCode || currentRoom });
    room.phase = 'lobby';
    room.lastActivityAt = Date.now();
    io.to(room.roomCode).emit('state_update', room);
    await persistRoomState(room);
  });

  // Player joins with avatar
  socket.on('player_join', async ({ roomCode, player }) => {
    const room = await getRoom(roomCode || currentRoom);
    if (!room) return socket.emit('room_not_found', { roomCode: roomCode || currentRoom });
    if (!player || !player.id) return;

    // Protection 1: Max 80 players per room
    const MAX_PLAYERS = 80;
    const currentCount = Object.keys(room.players || {}).length;
    if (!room.players[player.id] && currentCount >= MAX_PLAYERS) {
      socket.emit('player_error', { message: 'This room has reached max capacity (80 guests).' });
      return;
    }

    // Protection 2: Anti-Duplicate Device Enforcement (1 Player per Device)
    // If this device already registered a player in this room with an older ID,
    // remove the previous ghost player to prevent duplicate fake users!
    room.devicePlayers = room.devicePlayers || {};
    const existingPlayerId = room.devicePlayers[deviceId];
    if (existingPlayerId && existingPlayerId !== player.id && room.players[existingPlayerId]) {
      console.log(`[Anti-Spam] Device ${deviceId} replaced older ghost player ${existingPlayerId} with ${player.id}`);
      delete room.players[existingPlayerId];
      // Clean up previous ghost votes
      Object.keys(room.votes || {}).forEach((rId) => {
        delete room.votes[rId]?.[existingPlayerId];
      });
    }
    room.devicePlayers[deviceId] = player.id;

    // Protection 3: Data Sanitization (protects React from corrupted props)
    const sanitizedPlayer = {
      id: String(player.id).substring(0, 50),
      name: String(player.name || 'Guest').trim().substring(0, 24),
      displayName: String(player.displayName || player.name || 'Guest').trim().substring(0, 32),
      color: String(player.color || '#9b1c1c').substring(0, 16),
      gender: player.gender === 'M' || player.gender === 'F' ? player.gender : 'P',
      titleEmoji: String(player.titleEmoji || '👤').substring(0, 8),
      titleAction: String(player.titleAction || 'has entered the Swayamvar').substring(0, 60),
      titleImg: typeof player.titleImg === 'string' ? player.titleImg.substring(0, 200) : '',
      joinedAt: Date.now(),
    };

    room.players[sanitizedPlayer.id] = sanitizedPlayer;
    room.lastActivityAt = Date.now();

    console.log(`[Join] Player "${sanitizedPlayer.displayName}" (${sanitizedPlayer.id}) entered room ${room.roomCode} (Total: ${Object.keys(room.players).length})`);
    io.to(room.roomCode).emit('state_update', room);
    io.to(room.roomCode).emit('player_joined_event', sanitizedPlayer);
    schedulePersistRoomState(room);
  });

  // Host: Kick a specific fake/inactive player
  socket.on('host_kick_player', async ({ roomCode, playerId }) => {
    const room = await getRoom(roomCode || currentRoom);
    if (!room || !playerId || !room.players[playerId]) return;

    const kickedName = room.players[playerId].displayName || room.players[playerId].name;
    delete room.players[playerId];

    // Clean up any votes cast by this player in any round
    Object.keys(room.votes || {}).forEach((rId) => {
      if (room.votes[rId]?.[playerId]) {
        delete room.votes[rId][playerId];
      }
    });

    // Clean up device mapping
    if (room.devicePlayers) {
      for (const [dId, pId] of Object.entries(room.devicePlayers)) {
        if (pId === playerId) delete room.devicePlayers[dId];
      }
    }

    room.lastActivityAt = Date.now();
    console.log(`👢 [Host Kick] Kicked player "${kickedName}" (${playerId}) from room ${room.roomCode}`);

    io.to(room.roomCode).emit('state_update', room);
    io.to(room.roomCode).emit('player_kicked_event', { playerId, name: kickedName });
    schedulePersistRoomState(room);
  });

  // Host: Purge all inactive guests who haven't locked in the current round
  socket.on('host_purge_unlocked', async ({ roomCode }) => {
    const room = await getRoom(roomCode || currentRoom);
    if (!room) return;

    const roundIds = ['marry', 'date', 'mum', 'emergency'];
    const currentRoundId = roundIds[room.roundIndex || 0] || 'marry';
    const currentVotes = room.votes[currentRoundId] || {};

    let purgedCount = 0;
    Object.keys(room.players).forEach((pId) => {
      if (!currentVotes[pId]) {
        delete room.players[pId];
        purgedCount++;
      }
    });

    room.lastActivityAt = Date.now();
    console.log(`🧹 [Host Purge] Purged ${purgedCount} unlocked/ghost player(s) from room ${room.roomCode}`);
    io.to(room.roomCode).emit('state_update', room);
    schedulePersistRoomState(room);
  });

  // Player casts and locks vote
  socket.on('player_vote', async ({ roomCode, roundId, playerId, suitorId }, callback) => {
    const room = await getRoom(roomCode || currentRoom);
    if (!room || !roundId || !playerId || !suitorId) return;

    if (!room.votes[roundId]) {
      room.votes[roundId] = {};
    }

    // STRICT DOUBLE-VOTE PREVENTION:
    // If player already locked their vote for this round, ignore duplicate
    if (room.votes[roundId][playerId]) {
      console.log(`[Vote Reject] Player ${playerId} already locked vote for ${roundId}`);
      if (typeof callback === 'function') {
        callback({ error: 'Vote already locked for this question.' });
      }
      return;
    }

    // Record the locked vote
    room.votes[roundId][playerId] = suitorId;
    room.lastActivityAt = Date.now();

    const voter = room.players[playerId];
    const totalPlayers = Object.keys(room.players).length;
    const votesCount = Object.keys(room.votes[roundId]).length;
    const allLocked = votesCount >= totalPlayers;

    console.log(`[Vote Locked] ${voter?.displayName || voter?.name || playerId} locked ${suitorId} for round ${roundId} (${votesCount}/${totalPlayers} locked)`);

    // Acknowledge to client
    if (typeof callback === 'function') {
      callback({ success: true, suitorId });
    }

    // Broadcast updated state to all clients in the room
    io.to(room.roomCode).emit('state_update', room);

    // Specific event for animated pop on host screen
    io.to(room.roomCode).emit('vote_locked_event', {
      playerId,
      playerName: voter?.displayName || voter?.name || 'A Guest',
      titleEmoji: voter?.titleEmoji || '💍',
      roundId,
      suitorId,
      votesCount,
      totalPlayers,
      allLocked,
    });

    await persistRoomState(room);
    await persistIndividualVote(room.roomCode, playerId, voter?.displayName || voter?.name, roundId, suitorId);
  });

  // Host: Show Gallery
  socket.on('host_show_gallery', async ({ roomCode }) => {
    const room = await getRoom(roomCode || currentRoom);
    if (!room) return;
    room.phase = 'gallery';
    room.galleryIndex = 0;
    room.lastActivityAt = Date.now();
    io.to(room.roomCode).emit('state_update', room);
    await persistRoomState(room);
  });

  // Host: Advance Gallery
  socket.on('host_advance_gallery', async ({ roomCode }) => {
    const room = await getRoom(roomCode || currentRoom);
    if (!room) return;
    room.galleryIndex = (room.galleryIndex || 0) + 1;
    room.lastActivityAt = Date.now();
    io.to(room.roomCode).emit('state_update', room);
    await persistRoomState(room);
  });

  // Host: Start Round / Open Voting
  socket.on('host_start_round', async ({ roomCode, roundIndex }) => {
    const room = await getRoom(roomCode || currentRoom);
    if (!room) return;
    room.phase = 'voting';
    room.roundIndex = typeof roundIndex === 'number' ? roundIndex : room.roundIndex;
    room.countdownStartedAt = Date.now();
    room.lastActivityAt = Date.now();
    io.to(room.roomCode).emit('state_update', room);
    await persistRoomState(room);
  });

  // Host: Close Voting / Show Results
  socket.on('host_close_voting', async ({ roomCode, force }) => {
    const room = await getRoom(roomCode || currentRoom);
    if (!room) return;
    
    room.phase = 'results';
    room.countdownStartedAt = null;
    room.lastActivityAt = Date.now();
    io.to(room.roomCode).emit('state_update', room);
    await persistRoomState(room);
  });

  // Host: Next Round
  socket.on('host_next_round', async ({ roomCode }) => {
    const room = await getRoom(roomCode || currentRoom);
    if (!room) return;
    const nextIdx = (room.roundIndex || 0) + 1;
    if (nextIdx >= 4) {
      room.phase = 'finale';
    } else {
      room.phase = 'voting';
      room.roundIndex = nextIdx;
      room.countdownStartedAt = Date.now();
    }
    room.lastActivityAt = Date.now();
    io.to(room.roomCode).emit('state_update', room);
    await persistRoomState(room);
  });

  // Host: Completely delete the room, its votes from 'votes' table, and state from 'games' table
  socket.on('host_delete_room', async ({ roomCode }, callback) => {
    const code = (roomCode || currentRoom || '').toUpperCase();
    if (!code) return;

    console.log(`🗑️ [Room Delete] Completely wiping room ${code} and its database records...`);

    // 1. Delete all individual rows from Supabase 'votes' table
    if (db) {
      try {
        const { error: vErr } = await db.from('votes').delete().eq('room_code', `shaadi-${code}`);
        if (vErr) console.error(`❌ [DB Error] Failed to delete votes for ${code}:`, vErr.message);
        else console.log(`🗑️ [DB] Wiped all votes for room shaadi-${code}`);
      } catch (err) {
        console.error('❌ [DB Vote Delete Exception]:', err.message);
      }

      // 2. Delete the room row from Supabase 'games' table
      try {
        const { error: gErr } = await db.from('games').delete().eq('room_code', `shaadi-${code}`);
        if (gErr) console.error(`❌ [DB Error] Failed to delete game for ${code}:`, gErr.message);
        else console.log(`🗑️ [DB] Wiped game row shaadi-${code}`);
      } catch (err) {
        console.error('❌ [DB Game Delete Exception]:', err.message);
      }
    }

    // 3. Clear from in-memory cache
    rooms.delete(code);

    // 4. Broadcast room_deleted event so all users (host + players) redirect to Home
    io.to(code).emit('room_deleted', { roomCode: code });

    if (typeof callback === 'function') {
      callback({ success: true, roomCode: code });
    }
  });

  // Host: Show Finale
  socket.on('host_show_finale', async ({ roomCode }) => {
    const room = await getRoom(roomCode || currentRoom);
    if (!room) return;
    room.phase = 'finale';
    room.lastActivityAt = Date.now();
    io.to(room.roomCode).emit('state_update', room);
    await persistRoomState(room);
  });

  // Host: Reset to Lobby
  socket.on('host_reset_lobby', async ({ roomCode }) => {
    const code = roomCode || currentRoom;
    const room = await getRoom(code);
    if (!room) return;
    const fresh = createFreshRoomState(code);
    fresh.phase = 'lobby';
    rooms.set(code, fresh);
    io.to(code).emit('state_update', fresh);
    await persistRoomState(fresh);
  });

  socket.on('disconnect', () => {
    if (connectedDevices.get(deviceId) === socket.id) {
      connectedDevices.delete(deviceId);
    }
    if (currentUserId && currentRoom) {
      console.log(`[Disconnect] ${currentUserId} disconnected from ${currentRoom}`);
    }
  });
});

// Serve production static frontend if built (Single Web Service on Render)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// Catch-all route for frontend client-side routing (/host, /user, /stats)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }
  const indexHtml = path.join(frontendDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      next();
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`💍 Swayamvar Server running on port ${PORT}`);
  console.log(`⚡ WebSocket ready with Socket.IO`);
  console.log(`🌐 Health endpoint: http://localhost:${PORT}/health`);
  console.log(`📊 Live Stats endpoint: http://localhost:${PORT}/api/stats`);
  console.log(`===============================================`);
});

// Periodic live stats broadcast
setInterval(() => {
  try {
    if (io && io.engine && io.engine.clientsCount > 0) {
      io.emit('server_stats_update', getServerStats());
    }
  } catch (_e) {}
}, 2500);

// Memory Leak Prevention: Sweep rooms inactive for > 4 hours every 30 minutes
// Since rooms are backed by Supabase DB, they are safely rehydrated on demand
setInterval(() => {
  const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
  let swept = 0;
  for (const [code, room] of rooms.entries()) {
    if (room.lastActivityAt && room.lastActivityAt < fourHoursAgo) {
      rooms.delete(code);
      swept++;
    }
  }
  if (swept > 0) {
    console.log(`🧹 [Memory GC] Cleaned up ${swept} inactive room(s) from memory`);
  }
}, 30 * 60 * 1000);
