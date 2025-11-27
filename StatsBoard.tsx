import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ReactionRecord } from '../types';
import { Trophy, Timer, Zap } from 'lucide-react';

interface StatsBoardProps {
  history: ReactionRecord[];
  bestTime: number | null;
}

export const StatsBoard: React.FC<StatsBoardProps> = ({ history, bestTime }) => {
  if (history.length === 0) return null;

  // Average of LAST 3 ONLY
  const lastThree = history.slice(-3);
  const avgTime = Math.round(lastThree.reduce((acc, curr) => acc + curr.time, 0) / lastThree.length);
  
  const latest = history[history.length - 1].time;
  const currentBest = bestTime || Math.min(...history.map(r => r.time));

  // Prepare data for chart (already capped at 10 by parent, but safe to map)
  const chartData = history.map((r, i) => ({
    attempt: i + 1,
    time: r.time
  }));

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      {/* Stat Cards */}
      <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center bg-black/40">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Trophy size={18} className="text-yellow-500" />
          <span className="text-xs uppercase tracking-wider font-bold text-f1-red">Personal Best</span>
        </div>
        <div className="text-3xl font-display font-bold text-white">{currentBest} <span className="text-sm text-gray-500">ms</span></div>
      </div>

      <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center border-t-4 border-t-f1-red bg-gradient-to-b from-f1-red/20 to-black/60">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Zap size={18} className="text-f1-red" />
          <span className="text-xs uppercase tracking-wider font-bold text-white">Latest</span>
        </div>
        <div className={`text-4xl font-display font-bold ${latest < 250 ? 'text-green-400' : 'text-white'}`}>
            {latest} <span className="text-sm text-gray-500">ms</span>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center bg-black/40">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Timer size={18} className="text-blue-400" />
          <span className="text-xs uppercase tracking-wider font-bold text-f1-red">Avg (Last 3)</span>
        </div>
        <div className="text-3xl font-display font-bold text-white">{avgTime} <span className="text-sm text-gray-500">ms</span></div>
      </div>

      {/* Chart */}
      <div className="md:col-span-3 glass-panel p-4 rounded-xl h-64 bg-black/60">
        <h3 className="text-xs uppercase tracking-wider font-bold text-f1-red mb-4 font-pixel text-[10px] flex justify-between">
            <span>TELEMETRY_DATA_V2.0</span>
            <span>LAST_10_SECTORS</span>
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#331111" />
            <XAxis dataKey="attempt" stroke="#666" fontSize={12} tick={false} />
            <YAxis stroke="#666" fontSize={12} domain={['dataMin - 50', 'dataMax + 50']} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#150000', border: '1px solid #FF1801', borderRadius: '4px' }}
                itemStyle={{ color: '#E0E0E0', fontFamily: 'monospace' }}
                cursor={{stroke: '#FF1801', strokeWidth: 1}}
                formatter={(value: number) => [`${value} ms`, 'Reaction']}
                labelFormatter={() => ''}
            />
            <Line type="monotone" dataKey="time" stroke="#FF1801" strokeWidth={3} dot={{ fill: '#FF1801', r: 4 }} activeDot={{ r: 7, fill: 'white' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};