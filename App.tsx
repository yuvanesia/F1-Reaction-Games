import React, { useState, useEffect, useRef, useCallback } from 'react';
import { F1Lights } from './components/F1Lights';
import { StatsBoard } from './components/StatsBoard';
import { RaceEngineer } from './components/RaceEngineer';
import { PixelTrack } from './components/PixelTrack';
import { Auth } from './components/Auth';
import { ModeSelector } from './components/ModeSelector';
import { Leaderboard } from './components/Leaderboard';
import { GameState, ReactionRecord, RaceEngineerResponse, GameMode, User } from './types';
import { getRaceEngineerComment } from './services/geminiService';
import { authService, leaderboardService } from './services/mockBackend';
import { RotateCcw, AlertTriangle, Power, LogOut, Trophy, Flag, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'AUTH' | 'MENU' | 'GAME' | 'LEADERBOARD'>('AUTH');

  // Game Config State
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.CLASSIC);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  
  // Gameplay State
  const [activeLights, setActiveLights] = useState(0);
  const [areLightsOut, setAreLightsOut] = useState(false);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [liveTime, setLiveTime] = useState(0); // For live counter during green
  const [roundCount, setRoundCount] = useState(0);
  
  // Stats State
  const [history, setHistory] = useState<ReactionRecord[]>([]);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [sessionScore, setSessionScore] = useState<number | null>(null); // For Sprint/Endurance result
  
  // Mouse position for parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // AI State
  const [aiResponse, setAiResponse] = useState<RaceEngineerResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Timers and Refs
  const startTimeRef = useRef<number>(0);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  // --- Auth & Init ---
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setView('MENU');
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('MENU');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setView('AUTH');
    setHistory([]);
  };

  const enterGame = () => {
    setHistory([]);
    setRoundCount(0);
    setSessionScore(null);
    setBestTime(null);
    setGameState(GameState.IDLE);
    setAiResponse(null);
    setView('GAME');
  };

  // --- Audio System ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    gain.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + duration);
  }, []);

  const playLightBeep = useCallback(() => playTone(600, 'sine', 0.15, 0.15), [playTone]);
  
  const playGoSound = useCallback(() => {
    // New crisper sound: High pitch ping
    if (!audioCtxRef.current) return;
    const t = audioCtxRef.current.currentTime;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(t + 0.2);
  }, []);

  const playErrorSound = useCallback(() => playTone(100, 'sawtooth', 0.4, 0.2), [playTone]);

  // --- Game Loop ---
  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current = [];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const getTotalRounds = () => {
    if (gameMode === GameMode.SPRINT) return 5;
    if (gameMode === GameMode.ENDURANCE) return 20;
    return null;
  };

  // Live Timer Loop
  useEffect(() => {
    if (gameState === GameState.WAITING) {
      const updateTimer = () => {
        setLiveTime(Date.now() - startTimeRef.current);
        rafRef.current = requestAnimationFrame(updateTimer);
      };
      rafRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState]);

  const startRound = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    initAudio();

    if (gameState === GameState.SEQUENCE || gameState === GameState.READY) {
      handleInteraction(); // Jump start
      return;
    }

    if (gameState === GameState.FINISHED) {
        // Reset game if clicked after finish
        enterGame();
        return;
    }

    // Prepare next round
    setGameState(GameState.SEQUENCE);
    setActiveLights(0);
    setAreLightsOut(false);
    setReactionTime(null);
    setLiveTime(0);
    clearAllTimeouts();

    // Sequence
    for (let i = 1; i <= 5; i++) {
      const timeoutId = setTimeout(() => {
        setActiveLights(i);
        playLightBeep();
        if (i === 5) {
          setGameState(GameState.READY);
          const randomDelay = Math.random() * 3000 + 1000;
          const lightsOutId = setTimeout(() => {
            setAreLightsOut(true);
            playGoSound();
            setGameState(GameState.WAITING);
            startTimeRef.current = Date.now();
          }, randomDelay);
          timeoutIdsRef.current.push(lightsOutId);
        }
      }, i * 1000);
      timeoutIdsRef.current.push(timeoutId);
    }
  }, [gameState, playLightBeep, playGoSound, gameMode]);

  const handleInteraction = useCallback(() => {
    if (gameState === GameState.IDLE || gameState === GameState.RESULT || gameState === GameState.FALSE_START || gameState === GameState.FINISHED) return;

    if (gameState === GameState.WAITING) {
      // Valid Reaction
      const endTime = Date.now();
      const time = endTime - startTimeRef.current;
      setReactionTime(time);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      const newRecord: ReactionRecord = {
        id: crypto.randomUUID(),
        time,
        timestamp: Date.now()
      };

      const newHistory = [...history, newRecord];
      const maxHistory = gameMode === GameMode.CLASSIC ? 10 : 20; // Keep more history for endurance
      setHistory(newHistory.slice(-maxHistory));
      setBestTime(prev => (prev === null ? time : Math.min(prev, time)));
      setRoundCount(prev => prev + 1);

      // Check Game Over Conditions
      const totalRounds = getTotalRounds();
      const isGameOver = totalRounds && (roundCount + 1) >= totalRounds;

      if (isGameOver) {
          setGameState(GameState.FINISHED);
          // Calculate Score
          const relevantHistory = [...newHistory].slice(-(totalRounds || 5)); 
          const avg = Math.round(relevantHistory.reduce((a, b) => a + b.time, 0) / relevantHistory.length);
          setSessionScore(avg);
          
          if (currentUser) {
              leaderboardService.submitScore(currentUser, gameMode, avg);
          }
      } else {
          setGameState(GameState.RESULT);
      }

      // Trigger AI
      setAiLoading(true);
      getRaceEngineerComment(time, gameMode, roundCount + 1, totalRounds)
        .then(response => setAiResponse(response))
        .catch(err => console.error(err))
        .finally(() => setAiLoading(false));

    } else if (gameState === GameState.SEQUENCE || gameState === GameState.READY) {
      // False Start
      setGameState(GameState.FALSE_START);
      playErrorSound();
      clearAllTimeouts();
      setActiveLights(5);
    }
  }, [gameState, playErrorSound, history, gameMode, roundCount, currentUser]);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  // Parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: (e.clientX - window.innerWidth / 2) / 50, y: (e.clientY - window.innerHeight / 2) / 50 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Styles
  const getBackgroundStyle = () => {
    if (gameState === GameState.FALSE_START) return 'bg-red-950';
    if (gameState === GameState.WAITING) return 'bg-[#00d26a]'; // Signal Green
    if (gameState === GameState.RESULT || gameState === GameState.FINISHED) return 'bg-gradient-to-br from-[#8a0000] via-[#4a0000] to-black';
    return 'bg-gradient-to-br from-[#FF1801] via-[#8a0000] to-[#1a0000]'; 
  };

  // Determine if we want a smooth transition or a rough cut
  // If waiting (Green light), we want INSTANT change. Otherwise smooth.
  const isInstantChange = gameState === GameState.WAITING;

  return (
    <div 
      className={`min-h-screen relative overflow-hidden ${isInstantChange ? '' : 'transition-colors duration-200'} ${getBackgroundStyle()} cursor-crosshair select-none font-body`}
      onMouseDown={() => gameState === GameState.WAITING || gameState === GameState.SEQUENCE || gameState === GameState.READY ? handleInteraction() : null}
      onTouchStart={() => gameState === GameState.WAITING || gameState === GameState.SEQUENCE || gameState === GameState.READY ? handleInteraction() : null}
      style={{ touchAction: 'manipulation' }}
    >
      <PixelTrack />

      <div 
        className="relative z-10 min-h-screen flex flex-col items-center py-6 px-4 perspective-container"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)`, transition: 'transform 0.1s ease-out' }}
      >
        {/* Header */}
        <header className="mb-6 text-center relative w-full max-w-4xl flex justify-between items-start">
          <div className="text-left">
            <h2 className="text-white font-pixel text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-90">
              Round 6-7 Rajeeth GP
            </h2>
            <h1 className="text-2xl md:text-4xl font-display font-black italic text-white drop-shadow-md">
              F1 REFLEX
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 block md:inline md:ml-2">2025</span>
            </h1>
          </div>
          
          {currentUser && (
              <div className="flex flex-col items-end gap-2">
                 <div className="glass-panel px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-mono text-white font-bold">{currentUser.username}</span>
                 </div>
                 {view !== 'AUTH' && (
                     <button onClick={handleLogout} className="text-[10px] text-white/50 hover:text-white flex items-center gap-1">
                        <LogOut size={10} /> LOGOUT
                     </button>
                 )}
              </div>
          )}
        </header>

        {/* --- VIEW: AUTH --- */}
        {view === 'AUTH' && <Auth onLogin={handleLogin} />}

        {/* --- VIEW: MENU --- */}
        {view === 'MENU' && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-5 duration-500">
             <h2 className="text-2xl font-display font-bold text-white mb-6">SELECT RACE MODE</h2>
             <ModeSelector selectedMode={gameMode} onSelect={setGameMode} />
             
             <div className="flex gap-4">
                <button 
                  onClick={enterGame}
                  className="bg-white text-f1-red font-black font-display text-xl px-12 py-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <Flag /> RACE
                </button>
                <button 
                   onClick={() => setView('LEADERBOARD')}
                   className="glass-panel text-white font-bold font-display text-xl px-8 py-4 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                   <Trophy size={20} className="text-yellow-400" /> STANDINGS
                </button>
             </div>
          </div>
        )}

        {/* --- VIEW: LEADERBOARD --- */}
        {view === 'LEADERBOARD' && (
            <Leaderboard currentMode={gameMode} onClose={() => setView('MENU')} />
        )}

        {/* --- VIEW: GAME --- */}
        {view === 'GAME' && (
          <div className="w-full flex flex-col items-center max-w-5xl flex-1 animate-in zoom-in duration-300">
             
             {/* HUD */}
             <div className="w-full flex justify-between items-center mb-4 px-4 font-mono text-xs text-white/60">
                 <button onClick={() => setView('MENU')} className="hover:text-white underline">{'< MENU'}</button>
                 <div className="flex gap-4">
                     <span className="text-f1-red font-bold">{gameMode}</span>
                     <span>LAP {roundCount + (gameState === GameState.WAITING || gameState === GameState.RESULT ? 0 : 1)} / {getTotalRounds() || '∞'}</span>
                 </div>
             </div>

            <div className="scale-75 md:scale-100 transition-transform duration-300">
              <F1Lights activeLights={activeLights} areLightsOut={areLightsOut} />
            </div>

            {/* Game Status / Button Area */}
            <div className="h-48 flex flex-col items-center justify-center text-center my-2 w-full">
              {(gameState === GameState.IDLE || gameState === GameState.RESULT || gameState === GameState.FALSE_START) && (
                <div className="animate-in fade-in zoom-in duration-500">
                    <button 
                      onClick={startRound}
                      className="
                          relative group w-32 h-32 md:w-40 md:h-40 rounded-full 
                          bg-gradient-to-br from-white to-gray-300
                          shadow-[0_0_50px_rgba(255,255,255,0.4)]
                          hover:shadow-[0_0_80px_rgba(255,255,255,0.6)]
                          hover:scale-105 active:scale-95
                          transition-all duration-300
                          flex flex-col items-center justify-center
                          border-none outline-none
                      "
                    >
                      <Power className="w-10 h-10 text-f1-red mb-1 group-hover:rotate-180 transition-transform duration-700" strokeWidth={3} />
                      <span className="font-display font-black text-f1-red text-sm md:text-lg tracking-tight leading-none">
                          {gameState === GameState.IDLE ? 'START' : 'NEXT'}<br/>ROUND
                      </span>
                      <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping opacity-20 pointer-events-none"></div>
                    </button>
                    <p className="mt-6 text-white/70 font-mono text-[10px] uppercase tracking-widest">Tap to Launch</p>
                </div>
              )}

              {gameState === GameState.FINISHED && (
                  <div className="flex flex-col items-center animate-in zoom-in duration-500">
                      <div className="flex items-center gap-2 text-yellow-400 mb-2">
                          <Flag size={32} />
                          <span className="font-display font-bold text-2xl">SESSION COMPLETE</span>
                      </div>
                      <div className="glass-panel p-6 rounded-xl border-2 border-f1-red bg-black/80">
                          <div className="text-gray-400 font-mono text-xs uppercase mb-1">Session Average</div>
                          <div className="text-6xl font-display font-black text-white mb-4">{sessionScore} ms</div>
                          <button onClick={enterGame} className="bg-white text-black font-bold px-6 py-2 rounded-full hover:bg-gray-200">
                              RESTART SESSION
                          </button>
                      </div>
                  </div>
              )}

              {gameState === GameState.SEQUENCE && (
                <span className="text-4xl font-display font-bold text-white tracking-widest animate-pulse drop-shadow-md">ENGAGE CLUTCH</span>
              )}
              
              {/* Show Live Timer when Waiting (Green) */}
              {gameState === GameState.WAITING && (
                 <div className="flex flex-col items-center animate-in zoom-in duration-100">
                  <span className="text-8xl md:text-9xl font-display font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    {liveTime}<span className="text-3xl md:text-5xl text-white/50 ml-2 italic">ms</span>
                  </span>
                </div>
              )}
              
              {gameState === GameState.RESULT && reactionTime !== null && (
                <div className="flex flex-col items-center animate-in zoom-in duration-200">
                  <span className="text-8xl md:text-9xl font-display font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    {reactionTime}<span className="text-3xl md:text-5xl text-white/50 ml-2 italic">ms</span>
                  </span>
                </div>
              )}

              {gameState === GameState.FALSE_START && (
                <div className="flex flex-col items-center animate-pulse">
                  <AlertTriangle size={64} className="text-white mb-4" />
                  <span className="text-5xl font-display font-black text-white tracking-tighter">JUMP START</span>
                  <span className="text-white mt-2 font-pixel text-xs bg-black/50 p-2 rounded">+5.00 SEC PENALTY</span>
                </div>
              )}
            </div>

            {/* AI Commentary */}
            <div className="w-full min-h-[140px] mb-4 z-20">
              <RaceEngineer data={aiResponse} loading={aiLoading} />
            </div>

            {/* Stats */}
            <StatsBoard history={history} bestTime={bestTime} />
          </div>
        )}

        <footer className="mt-auto pt-6 pb-4 text-white/40 text-[10px] text-center font-pixel flex flex-col gap-1">
          <p>FIA OFFICIAL TIMING PARTNER /// RAJEETH GP</p>
          <p className="text-[8px] opacity-70 mt-2">ITS ALL FICTIONAL AND MAKE SURE NO COPYRIGHT ISSUE</p>
          <p className="text-[8px] opacity-70">BUILT WITH YUVANESIA.IO AND GEMINI 3</p>
        </footer>
      </div>
    </div>
  );
};

export default App;