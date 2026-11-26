import React, { useState, useEffect } from 'react';
import { socket } from '../../socket.js';

export function ServerStats({ onBack }) {
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [error, setError] = useState(null);
  const [wiping, setWiping] = useState(false);

  const getApiBase = () => {
    return window.location.port === '3000'
      ? `${window.location.protocol}//${window.location.hostname}:4000`
      : window.location.origin;
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${getApiBase()}/api/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      setError('Could not reach backend stats endpoint');
    }
  };

  const handleDeleteSingleRoom = async (code) => {
    if (!window.confirm(`Delete Room ${code}?\n\nThis will permanently delete this room and all its votes from Supabase.`)) {
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/api/room/${code}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      alert('Failed to delete room: ' + err.message);
    }
  };

  const handleWipeDatabase = async () => {
    if (!window.confirm('⚠️ DANGER: Completely wipe the database?\n\nThis will PERMANENTLY ERASE all games and all votes from Supabase, clear all server rooms, and disconnect all players.')) {
      return;
    }
    setWiping(true);
    try {
      const res = await fetch(`${getApiBase()}/api/wipe-database`, { method: 'POST' });
      if (res.ok) {
        alert('✅ Database wiped cleanly!');
        fetchStats();
      }
    } catch (err) {
      alert('Failed to wipe database: ' + err.message);
    } finally {
      setWiping(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);

    const onStatsUpdate = (data) => {
      if (data) {
        setStats(data);
        setLastUpdated(Date.now());
        setError(null);
      }
    };

    socket.on('server_stats_update', onStatsUpdate);
    return () => {
      clearInterval(interval);
      socket.off('server_stats_update', onStatsUpdate);
    };
  }, []);

  const ramPercent = stats?.renderCapacity?.ramUsedPercent
    ? parseFloat(stats.renderCapacity.ramUsedPercent)
    : 0;

  const ramStatusColor = ramPercent > 80 ? '#ef4444' : ramPercent > 50 ? '#f59e0b' : '#10b981';

  return (
    <div
      className="screen bg-bfiw-dark fade"
      style={{
        minHeight: '100vh',
        padding: '30px 20px',
        background: '#0e0004',
        color: '#fff',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div className="caps" style={{ fontSize: '.7rem', color: '#fbbf24', letterSpacing: '.2em' }}>
              Render Free Tier Monitor
            </div>
            <h1 className="display" style={{ fontSize: '2.4rem', color: '#fff', margin: '4px 0 0' }}>
              Live Server Stats
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={fetchStats}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleWipeDatabase}
              disabled={wiping}
              style={{
                background: '#dc2626',
                border: '1px solid #ef4444',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 10,
                cursor: wiping ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                opacity: wiping ? 0.6 : 1,
              }}
            >
              {wiping ? '⏳ Wiping Database…' : '🧹 Wipe All Data & DB'}
            </button>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: '#9b1c1c',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                Back to App
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div style={{ background: '#7f1d1d', padding: 20, borderRadius: 16, color: '#fca5a5' }}>
            ⚠️ {error} — Ensure backend is running on port 4000
          </div>
        ) : !stats ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#fbbf24' }}>
            Fetching realtime telemetry…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {/* RAM Usage */}
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: 20, borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 700 }}>RENDER RAM USAGE (512 MB)</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: ramStatusColor, marginTop: 4 }}>
                  {stats.renderCapacity.currentUsageRAM}
                </div>
                <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.1)', height: 8, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(ramPercent, 100)}%`, height: '100%', background: ramStatusColor, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{stats.renderCapacity.ramUsedPercent} Used</span>
                  <span style={{ color: ramStatusColor, fontWeight: 700 }}>{stats.renderCapacity.status}</span>
                </div>
              </div>

              {/* Active Connections */}
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: 20, borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 700 }}>CONNECTED DEVICES</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                  {stats.traffic.uniqueDevices || stats.traffic.activeSockets}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 6 }}>
                  {stats.traffic.activeSockets} active socket{stats.traffic.activeSockets === 1 ? '' : 's'} (deduplicated)
                </div>
              </div>

              {/* Active Rooms */}
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: 20, borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 700 }}>ACTIVE ROOMS</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
                  {stats.traffic.activeRooms}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 6 }}>
                  {stats.traffic.totalPlayersConnected} players seated
                </div>
              </div>

              {/* Uptime & Database */}
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: 20, borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 700 }}>UPTIME & SUPABASE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a7f3d0', marginTop: 4 }}>
                  ⏱️ {stats.uptime}
                </div>
                <div style={{ fontSize: '0.8rem', color: stats.database.connected ? '#34d399' : '#f87171', marginTop: 8, fontWeight: 700 }}>
                  ● Supabase: {stats.database.connected ? 'Connected' : 'Offline'}
                </div>
              </div>
            </div>

            {/* Active Rooms Detail */}
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#fde68a' }}>
                Active Game Rooms ({stats.rooms.length})
              </h3>

              {stats.rooms.length === 0 ? (
                <div style={{ color: '#888', fontStyle: 'italic', padding: '16px 0' }}>
                  No active rooms currently open.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.rooms.map((r) => (
                    <div
                      key={r.roomCode}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 18px',
                        borderRadius: 12,
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(251,191,36,0.2)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.1em' }}>
                          ROOM {r.roomCode}
                        </span>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.1)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          Phase: {r.phase}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.85rem' }}>
                        <span>👥 {r.playersCount} Players</span>
                        <span>🗳️ {r.votesCount} Locked</span>
                        <span style={{ color: '#888', fontSize: '0.75rem' }}>Active: {r.lastActivityAgo}</span>

                        <button
                          onClick={() => handleDeleteSingleRoom(r.roomCode)}
                          title={`Delete Room ${r.roomCode} and wipe all its votes from DB`}
                          style={{
                            background: 'rgba(239,68,68,0.2)',
                            border: '1px solid #ef4444',
                            color: '#fca5a5',
                            padding: '5px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          🗑️ Wipe Room
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
