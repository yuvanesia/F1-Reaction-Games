import React, { useEffect, useState } from 'react';
import { GameMode, LeaderboardEntry } from '../types';
import { leaderboardService } from '../services/mockBackend';
import { Trophy, Medal, Timer } from 'lucide-react';

interface LeaderboardProps {
  currentMode: GameMode;
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentMode, onClose }) => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      const data = await leaderboardService.getScores(currentMode);
      setScores(data);
      setLoading(false);
    };
    fetchScores();
  }, [currentMode]);

  const getRankStyle = (index: number) => {
    switch(index) {
        case 0: return "text-yellow-400 font-bold";
        case 1: return "text-gray-300 font-bold";
        case 2: return "text-amber-600 font-bold";
        default: return "text-gray-500";
    }
  };

  return (
    <div className="glass-panel w-full max-w-2xl mx-auto rounded-xl overflow-hidden flex flex-col max-h-[60vh] animate-in slide-in-from-bottom-10 duration-300">
      <div className="p-4 border-b border-white/10 bg-black/40 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
            <Trophy className="text-f1-red" size={20} />
            <h3 className="font-display font-bold text-white text-lg">GLOBAL STANDINGS</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-pixel text-f1-red bg-f1-red/10 px-2 py-1 rounded">
                {currentMode}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xs underline ml-4">
                CLOSE
            </button>
        </div>
      </div>

      <div className="overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-f1-red scrollbar-track-transparent">
        {loading ? (
            <div className="p-8 text-center text-gray-500 font-mono animate-pulse">
                FETCHING TELEMETRY...
            </div>
        ) : (
            <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-xs text-gray-400 font-mono uppercase sticky top-0">
                    <tr>
                        <th className="p-3 pl-6">Pos</th>
                        <th className="p-3">Driver</th>
                        <th className="p-3 text-right pr-6">Time (ms)</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((entry, i) => (
                        <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td className={`p-3 pl-6 font-mono ${getRankStyle(i)}`}>
                                {i + 1}
                            </td>
                            <td className="p-3 font-display font-medium text-white flex items-center gap-2">
                                {i === 0 && <Medal size={14} className="text-yellow-400" />}
                                {entry.username}
                            </td>
                            <td className="p-3 text-right pr-6 font-mono text-f1-red group-hover:text-white transition-colors">
                                {entry.score}
                            </td>
                        </tr>
                    ))}
                    {scores.length === 0 && (
                        <tr>
                            <td colSpan={3} className="p-8 text-center text-gray-500">No lap times recorded yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
};