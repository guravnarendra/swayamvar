#!/usr/bin/env node
/**
 * ====================================================================
 * Swayamvar Stress Tester & Player Simulator
 * ====================================================================
 * Connects X real WebSocket clients to simulate live classroom players.
 * Bots automatically join the room and vote when host opens rounds!
 *
 * Usage:
 *   node simulate-bots.js <roomCode> [count] [serverUrl]
 *
 * Examples:
 *   node simulate-bots.js 2497 10
 *   node simulate-bots.js 2497 50 http://localhost:4000
 *   node simulate-bots.js 2497 50 https://swayamvar.onrender.com
 * ====================================================================
 */

import { io } from './frontend/node_modules/socket.io-client/build/esm/index.js';

const roomCode = (process.argv[2] || '').trim().toUpperCase();
const count = parseInt(process.argv[3] || '10', 10);
const serverUrl = process.argv[4] || 'http://localhost:4000';

if (!roomCode) {
  console.log(`\n❌ Error: Please provide a 4-digit room code!`);
  console.log(`👉 Usage: node simulate-bots.js <roomCode> [count] [serverUrl]\n`);
  process.exit(1);
}

const PERSONAS = [
  { name: 'Sharma Ji', emoji: '👨‍💼', color: '#16a34a' },
  { name: 'SIP Sneha', emoji: '📈', color: '#dc2626' },
  { name: 'FD Lover Fufaji', emoji: '👴', color: '#0891b2' },
  { name: 'Gold Nani', emoji: '👵', color: '#d97706' },
  { name: 'Crypto Bunty', emoji: '🚀', color: '#7c3aed' },
  { name: 'Real Estate Chacha', emoji: '🏘️', color: '#ea580c' },
  { name: 'Tax Saver Tanvi', emoji: '📑', color: '#0f766e' },
  { name: 'Index Fund Ronny', emoji: '📊', color: '#ca8a04' },
  { name: 'Angel Investor Aman', emoji: '🦄', color: '#be185d' },
  { name: 'Budget Mama', emoji: '👛', color: '#4f46e5' },
];

const SUITORS = ['cash', 'debt', 'gold', 'realestate', 'equity', 'alternatives'];
const ROUND_IDS = ['marry', 'date', 'mum', 'emergency'];

console.log(`\n========================================================`);
console.log(`💍 Swayamvar Bot Simulator`);
console.log(`🎯 Target Room : ${roomCode}`);
console.log(`👥 Bot Count   : ${count} simulated players`);
console.log(`🌐 Server URL  : ${serverUrl}`);
console.log(`========================================================\n`);

const sockets = [];
let joinedCount = 0;
const votedInRound = {}; // roundIndex -> Set of botIds

for (let i = 1; i <= count; i++) {
  const persona = PERSONAS[(i - 1) % PERSONAS.length];
  const botId = `sim_bot_${i}_${Date.now()}`;
  const displayName = `${persona.name} #${i}`;

  const socket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    auth: { deviceId: `sim_dev_${botId}` },
    reconnection: true,
  });

  sockets.push(socket);

  socket.on('connect', () => {
    // Join room
    socket.emit('join_room', {
      roomCode,
      role: 'player',
      playerId: botId,
    });

    // Register player avatar
    socket.emit('player_join', {
      roomCode,
      player: {
        id: botId,
        name: displayName,
        displayName: displayName,
        color: persona.color,
        gender: i % 2 === 0 ? 'M' : 'F',
        titleEmoji: persona.emoji,
        titleAction: 'is evaluating suitors',
        titleImg: '',
      },
    });

    joinedCount++;
    process.stdout.write(`\r✅ Connected & Seated: ${joinedCount} / ${count} bots`);
    if (joinedCount === count) {
      console.log(`\n🎉 All ${count} bots successfully joined room ${roomCode}!\n👉 Start voting from the Host screen anytime.`);
    }
  });

  // Listen for game state updates to auto-vote
  socket.on('state_update', (roomState) => {
    if (!roomState || roomState.phase !== 'voting') return;

    const roundIdx = roomState.roundIndex || 0;
    const currentRoundId = ROUND_IDS[roundIdx] || 'marry';

    if (!votedInRound[roundIdx]) {
      votedInRound[roundIdx] = new Set();
    }

    if (votedInRound[roundIdx].has(botId)) return;

    // Stagger bot voting randomly between 1.2s and 4.5s
    const delay = 1200 + Math.random() * 2800 + (i * 70);
    setTimeout(() => {
      if (votedInRound[roundIdx].has(botId)) return;
      votedInRound[roundIdx].add(botId);

      const pickedSuitor = SUITORS[Math.floor(Math.random() * SUITORS.length)];
      socket.emit('player_vote', {
        roomCode,
        roundId: currentRoundId,
        playerId: botId,
        suitorId: pickedSuitor,
      });

      process.stdout.write(`\r🗳️  Round ${roundIdx + 1}: ${votedInRound[roundIdx].size} / ${count} bots locked vote`);
      if (votedInRound[roundIdx].size === count) {
        console.log(`\n✨ All ${count} bots have locked votes for Round ${roundIdx + 1}!`);
      }
    }, delay);
  });
}

// Clean shutdown on Ctrl+C
process.on('SIGINT', () => {
  console.log(`\n\n🛑 Disconnecting all ${sockets.length} bots...`);
  sockets.forEach((s) => s.disconnect());
  console.log(`👋 Done! Exited gracefully.\n`);
  process.exit(0);
});
