import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';

const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Lobby = lazy(() => import('./pages/Lobby'));
const AuctionRoom = lazy(() => import('./pages/AuctionRoom'));
const Results = lazy(() => import('./pages/Results'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

// IPL Pages
const IPLLanding = lazy(() => import('./pages/IPLLanding'));
const IPLLobby = lazy(() => import('./pages/IPLLobby'));
const IPLAuctionRoom = lazy(() => import('./pages/IPLAuctionRoom'));
const IPLResults = lazy(() => import('./pages/IPLResults'));

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#06060A', flexDirection: 'column', gap: '1rem',
    }}>
      <div style={{ fontSize: '3.5rem', animation: 'float 2s ease-in-out infinite' }}>🏏</div>
      <div style={{
        fontFamily: 'var(--font-impact)', fontSize: '1.4rem', letterSpacing: '0.2em',
        background: 'linear-gradient(135deg, #D4A843, #FFD700)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        LOADING...
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(12,12,18,0.97)',
            color: '#f5f0e8',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.88rem',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
        }}
      />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* ── IPL Auction (primary experience) ── */}
          <Route path="/" element={<Navigate to="/ipl" replace />} />
          <Route path="/ipl" element={<IPLLanding />} />
          <Route path="/ipl/lobby" element={<IPLLobby />} />
          <Route path="/ipl/room/:code" element={<IPLAuctionRoom />} />
          <Route path="/ipl/results/:code" element={<IPLResults />} />

          {/* ── Legacy generic auction ── */}
          <Route path="/classic" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/:id" element={<AuctionRoom />} />
          <Route path="/room/:id/result" element={<Results />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          <Route path="*" element={<Navigate to="/ipl" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
