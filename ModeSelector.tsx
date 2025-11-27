import React from 'react';
import { GameMode } from '../types';
import { Timer, Zap, Hourglass } from 'lucide-react';

interface ModeSelectorProps {
  onSelect: (mode: GameMode) => void;
  selectedMode: GameMode;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect, selectedMode }) => {
  const modes = [
    {
      id: GameMode.CLASSIC,
      label: 'CLASSIC',
      desc: 'Endless practice. No pressure.',
      icon: <Zap size={20} />,
      color: 'border-green-500/50 hover:border-green-500'
    },
    {
      id: GameMode.SPRINT,
      label: 'SPRINT',
      desc: '5 Rounds. Best Average wins.',
      icon: <Timer size={20} />,
      color: 'border-blue-500/50 hover:border-blue-500'
    },
    {
      id: GameMode.ENDURANCE,
      label: 'ENDURANCE',
      desc: '20 Rounds. Test your focus.',
      icon: <Hourglass size={20} />,
      color: 'border-purple-500/50 hover:border-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-8 animate-in slide-in-from-bottom-5 duration-500 delay-100">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelect(mode.id)}
          className={`
            glass-panel p-4 rounded-xl text-left transition-all duration-300 group relative overflow-hidden
            border-l-4 ${selectedMode === mode.id ? 'bg-white/10 translate-y-[-4px] shadow-lg ' + mode.color.replace('/50', '') : 'border-transparent opacity-70 hover:opacity-100 hover:bg-white/5'}
          `}
        >
          <div className="flex justify-between items-start mb-2">
             <div className={`p-2 rounded-lg bg-black/40 text-white`}>
                {mode.icon}
             </div>
             {selectedMode === mode.id && <span className="text-[10px] font-pixel text-white bg-f1-red px-2 py-1 rounded">SELECTED</span>}
          </div>
          <h3 className="font-display font-bold text-white text-lg tracking-wide">{mode.label}</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">{mode.desc}</p>
        </button>
      ))}
    </div>
  );
};