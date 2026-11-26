import React, { useState, useEffect } from 'react';
import { socket } from './socket.js';
import { ROUNDS } from './gameData.js';

// Home Landing
import { HomeLanding } from './components/Home/HomeLanding.jsx';

// Server Live Stats Dashboard
import { ServerStats } from './components/Stats/ServerStats.jsx';

// Host Views
import { HostCover } from './components/Host/HostCover.jsx';
import { HostLobby } from './components/Host/HostLobby.jsx';
import { HostGallery } from './components/Host/HostGallery.jsx';
import { HostVoting } from './components/Host/HostVoting.jsx';
import { HostResults } from './components/Host/HostResults.jsx';
import { HostFinale } from './components/Host/HostFinale.jsx';

// Player Views
import { PlayerJoin } from './components/Player/PlayerJoin.jsx';
import { PlayerCharacterWait } from './components/Player/PlayerCharacterWait.jsx';
import { PlayerGallery } from './components/Player/PlayerGallery.jsx';
import { PlayerVoting } from './components/Player/PlayerVoting.jsx';
import { PlayerResults } from './components/Player/PlayerResults.jsx';
import { PlayerFinale } from './components/Player/PlayerFinale.jsx';

// Error Boundary to prevent white screen of death on any component crash
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('⚠️ [UI Exception Caught]:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a0505',
            color: '#fff',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛡️</div>
          <h2 style={{ color: '#fbbf24', fontSize: '1.8rem', margin: 0 }}>
            Swayamvar UI Recovery
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 460, marginTop: 8, fontSize: '0.9rem' }}>
            A temporary display error occurred. Your room state is safely preserved on the server.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                background: '#059669',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              🔄 Refresh View
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fbbf24',
                border: '1px solid #fbbf24',
                padding: '10px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Hard Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Path parser for clean URLs: /host, /user, /stats
function parseRoute() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const search = new URLSearchParams(window.location.search);

  // Check path routes: /stats, /health, /host, /user
  if (pathname === '/stats' || search.get('view') === 'stats') {
    return { view: 'stats', role: null, roomCode: '' };
  }

  let role = null;
  let roomCode = (search.get('room') || '').toUpperCase();

  // /host or /host/1234
  if (pathname.startsWith('/host')) {
    role = 'host';
    const parts = pathname.split('/').filter(Boolean);
    if (parts[1]) roomCode = parts[1].toUpperCase();
  }
  // /user, /user/1234, /player, /player/1234
  else if (pathname.startsWith('/user') || pathname.startsWith('/player')) {
    role = 'player';
    const parts = pathname.split('/').filter(Boolean);
    if (parts[1]) roomCode = parts[1].toUpperCase();
  }
  // Backwards compatibility for ?role=host / ?role=player
  else if (search.get('role')) {
    role = search.get('role');
  }

  return { view: 'game', role, roomCode };
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const initialRoute = parseRoute();
  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [role, setRole] = useState(initialRoute.role);
  const [roomCode, setRoomCode] = useState(initialRoute.roomCode);

  const [gameState, setGameState] = useState(null);
  const [connected, setConnected] = useState(false);

  // Player state
  const [myPlayer, setMyPlayer] = useState(() => {
    try {
      if (!initialRoute.roomCode) return null;
      const saved = localStorage.getItem(`swayamvar_player_${initialRoute.roomCode}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [myVotes, setMyVotes] = useState({});

  // Sync with browser URL / room connection
  useEffect(() => {
    if (currentView === 'stats') return;
    if (!roomCode || !role) return;

    let playerId = null;
    if (role === 'player') {
      playerId = localStorage.getItem(`swayamvar_id_${roomCode}`);
      if (!playerId) {
        playerId = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        localStorage.setItem(`swayamvar_id_${roomCode}`, playerId);
      }
    }

    const joinData = { roomCode, role, playerId };

    const onConnect = () => {
      setConnected(true);
      socket.emit('join_room', joinData);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onStateUpdate = (state) => {
      setGameState(state);

      // Re-hydrate player votes for this room
      if (state?.votes && playerId) {
        const votesMap = {};
        Object.keys(state.votes).forEach((rId) => {
          if (state.votes[rId]?.[playerId]) {
            votesMap[rId] = state.votes[rId][playerId];
          }
        });
        setMyVotes(votesMap);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('state_update', onStateUpdate);

    const onPlayerKicked = ({ playerId: kickedId }) => {
      const myId = localStorage.getItem(`swayamvar_id_${roomCode}`);
      if (myId === kickedId) {
        localStorage.removeItem(`swayamvar_player_${roomCode}`);
        setMyPlayer(null);
        alert('You were removed from this room by the host.');
      }
    };
    socket.on('player_kicked_event', onPlayerKicked);

    const onRoomDeleted = ({ roomCode: deletedCode }) => {
      if (deletedCode === roomCode) {
        localStorage.removeItem(`swayamvar_player_${roomCode}`);
        localStorage.removeItem(`swayamvar_id_${roomCode}`);
        localStorage.removeItem(`swayamvar_is_host_${roomCode}`);
        alert(`Room ${roomCode} has been deleted.`);
        handleResetToHome();
      }
    };
    socket.on('room_deleted', onRoomDeleted);

    // If room does not exist in DB, backend emits room_not_found -> redirect to home
    const onRoomNotFound = ({ roomCode: missingCode, message }) => {
      localStorage.removeItem(`swayamvar_player_${missingCode}`);
      localStorage.removeItem(`swayamvar_id_${missingCode}`);
      localStorage.removeItem(`swayamvar_is_host_${missingCode}`);
      alert(message || `Room "${missingCode}" does not exist in database. Redirecting to home...`);
      handleResetToHome();
    };
    socket.on('room_not_found', onRoomNotFound);

    if (socket.connected) {
      setConnected(true);
      socket.emit('join_room', joinData);
    } else {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('state_update', onStateUpdate);
      socket.off('player_kicked_event', onPlayerKicked);
      socket.off('room_deleted', onRoomDeleted);
      socket.off('room_not_found', onRoomNotFound);
    };
  }, [roomCode, role, currentView]);

  /* ── Room Creation / Joining with Clean URLs ── */
  const handleCreateRoom = async () => {
    return new Promise((resolve) => {
      socket.emit('create_room', { hostId: 'host_' + Date.now() }, ({ roomCode: newCode }) => {
        setRoomCode(newCode);
        setRole('host');
        setCurrentView('game');
        localStorage.setItem(`swayamvar_is_host_${newCode}`, '1');

        // Clean URL: /host?room=XXXX
        window.history.pushState(null, '', `/host?room=${newCode}`);
        resolve(newCode);
      });
    });
  };

  const handleJoinRoom = (enteredCode) => {
    const code = enteredCode.toUpperCase();
    setRoomCode(code);
    setRole('player');
    setCurrentView('game');

    // Clean URL: /user?room=XXXX
    window.history.pushState(null, '', `/user?room=${code}`);

    // Load saved player profile if exists
    try {
      const saved = localStorage.getItem(`swayamvar_player_${code}`);
      if (saved) setMyPlayer(JSON.parse(saved));
    } catch {}
  };

  const handleResetToHome = () => {
    setRole(null);
    setRoomCode('');
    setGameState(null);
    setCurrentView('game');
    window.history.pushState(null, '', '/');
  };

  const handleGoToStats = () => {
    setCurrentView('stats');
    window.history.pushState(null, '', '/stats');
  };

  /* ── Host Handlers ── */
  const handleHostOpenLobby = () => socket.emit('host_open_lobby', { roomCode });
  const handleHostBegin = () => socket.emit('host_show_gallery', { roomCode });
  const handleHostAdvanceGallery = () => socket.emit('host_advance_gallery', { roomCode });
  const handleHostStartVoting = () => socket.emit('host_start_round', { roomCode, roundIndex: 0 });
  const handleHostForceClose = () => socket.emit('host_close_voting', { roomCode, force: true });
  const handleHostNextRound = () => socket.emit('host_next_round', { roomCode });
  const handleHostNewGame = () => {
    localStorage.removeItem(`swayamvar_is_host_${roomCode}`);
    handleResetToHome();
  };
  const handleHostDeleteRoom = () => {
    if (window.confirm(`Permanently delete Room ${roomCode}?\n\nThis will completely erase all votes and room data from the database.`)) {
      socket.emit('host_delete_room', { roomCode }, () => {
        localStorage.removeItem(`swayamvar_is_host_${roomCode}`);
        handleResetToHome();
      });
    }
  };
  const handleHostKickPlayer = (playerId) => socket.emit('host_kick_player', { roomCode, playerId });
  const handleHostPurgeUnlocked = () => socket.emit('host_purge_unlocked', { roomCode });

  /* ── Player Handlers ── */
  const handlePlayerJoin = (playerData) => {
    let playerId = localStorage.getItem(`swayamvar_id_${roomCode}`);
    if (!playerId) {
      playerId = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem(`swayamvar_id_${roomCode}`, playerId);
    }
    const fullPlayer = { ...playerData, id: playerId };
    setMyPlayer(fullPlayer);
    localStorage.setItem(`swayamvar_player_${roomCode}`, JSON.stringify(fullPlayer));
    socket.emit('player_join', { roomCode, player: fullPlayer });
  };

  const handlePlayerVote = (suitorId) => {
    const currentRound = ROUNDS[gameState?.roundIndex || 0];
    const playerId = localStorage.getItem(`swayamvar_id_${roomCode}`);
    if (!currentRound || !playerId) return;

    // Optimistic local update
    setMyVotes((prev) => ({ ...prev, [currentRound.id]: suitorId }));
    socket.emit('player_vote', {
      roomCode,
      roundId: currentRound.id,
      playerId,
      suitorId,
    });
  };

  /* ── Stats Dashboard View (/stats) ── */
  if (currentView === 'stats') {
    return <ServerStats onBack={handleResetToHome} />;
  }

  /* ── If no role or room, show Landing Page with Create / Join ── */
  if (!role || !roomCode) {
    return (
      <HomeLanding
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  // Loading state
  if (!gameState) {
    return (
      <div
        className="loading-screen"
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a0505',
          color: '#fbbf24',
          gap: 16,
        }}
      >
        <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.1em' }}>
          Connecting to Swayamvar Room {roomCode}…
        </div>
        <button
          onClick={handleResetToHome}
          style={{
            background: 'transparent',
            border: '1px solid rgba(251,191,36,0.4)',
            color: '#fbbf24',
            padding: '6px 16px',
            borderRadius: 999,
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          Cancel & Return Home
        </button>
      </div>
    );
  }

  /* ── Host Flow (/host) ── */
  if (role === 'host') {
    switch (gameState.phase) {
      case 'cover':
        return <HostCover onOpen={handleHostOpenLobby} />;
      case 'lobby':
        return (
          <HostLobby
            state={gameState}
            onBegin={handleHostBegin}
            onStartVoting={handleHostStartVoting}
            onKickPlayer={handleHostKickPlayer}
          />
        );
      case 'gallery':
        return (
          <HostGallery
            state={gameState}
            onAdvance={handleHostAdvanceGallery}
            onStartVoting={handleHostStartVoting}
          />
        );
      case 'voting':
        return (
          <HostVoting
            state={gameState}
            onForceClose={handleHostForceClose}
            onKickPlayer={handleHostKickPlayer}
            onPurgeUnlocked={handleHostPurgeUnlocked}
          />
        );
      case 'results':
        return <HostResults state={gameState} onNext={handleHostNextRound} />;
      case 'finale':
        return <HostFinale onReplay={handleHostNewGame} />;
      default:
        return (
          <HostLobby
            state={gameState}
            onBegin={handleHostBegin}
            onStartVoting={handleHostStartVoting}
            onKickPlayer={handleHostKickPlayer}
          />
        );
    }
  }

  /* ── Player Flow (/user) ── */
  if (!myPlayer) {
    return <PlayerJoin onJoin={handlePlayerJoin} />;
  }

  const currentRound = ROUNDS[gameState.roundIndex || 0];
  const votedId = myVotes[currentRound?.id];

  switch (gameState.phase) {
    case 'cover':
    case 'lobby':
      return <PlayerCharacterWait player={myPlayer} />;
    case 'gallery':
      return <PlayerGallery state={gameState} gender={myPlayer.gender} />;
    case 'voting':
      return (
        <PlayerVoting
          roundIndex={gameState.roundIndex}
          onVote={handlePlayerVote}
          votedSuitorId={votedId}
          gender={myPlayer.gender}
        />
      );
    case 'results':
      return <PlayerResults state={gameState} gender={myPlayer.gender} myVotes={myVotes} />;
    case 'finale':
      return <PlayerFinale myVotes={myVotes} player={myPlayer} onHome={handleResetToHome} />;
    default:
      return <PlayerCharacterWait player={myPlayer} />;
  }
}
