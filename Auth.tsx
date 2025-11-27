import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/mockBackend';
import { ChevronRight, Zap } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoading(true);
    const user = await authService.login(username);
    setLoading(false);
    onLogin(user);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-md mx-auto px-4 animate-in fade-in zoom-in duration-500">
      <div className="glass-panel p-8 rounded-2xl w-full border-t-4 border-f1-red relative overflow-hidden">
        
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap size={120} />
        </div>

        <h2 className="text-2xl font-display font-bold text-white mb-2">DRIVER LOGIN</h2>
        <p className="text-gray-400 text-sm mb-6 font-mono">Enter your super license credentials.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          <div>
            <label className="text-[10px] font-pixel text-f1-red mb-1 block">CALLSIGN / USERNAME</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. MadMax33"
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:border-f1-red focus:outline-none focus:ring-1 focus:ring-f1-red transition-all"
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !username.trim()}
            className="mt-2 bg-f1-red hover:bg-f1-darkRed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
                <span className="animate-pulse">AUTHENTICATING...</span>
            ) : (
                <>
                    ENTER PADDOCK <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500 font-mono">OFFICIAL FIA REACTION TESTER</p>
        </div>
      </div>
    </div>
  );
};