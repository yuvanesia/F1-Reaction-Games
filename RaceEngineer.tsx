import React from 'react';
import { RaceEngineerResponse } from '../types';
import { Radio, Loader2 } from 'lucide-react';

interface RaceEngineerProps {
  data: RaceEngineerResponse | null;
  loading: boolean;
}

export const RaceEngineer: React.FC<RaceEngineerProps> = ({ data, loading }) => {
  if (!data && !loading) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 glass-panel rounded-xl p-4 md:p-6 relative overflow-hidden group">
        {/* Scanning line animation */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10px] w-full animate-[pulse_2s_ease-in-out_infinite] pointer-events-none translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000" />

      <div className="flex items-start gap-4">
        <div className="bg-f1-red p-3 rounded-md shadow-[0_0_15px_rgba(255,24,1,0.5)]">
            <Radio className="text-white w-5 h-5 md:w-6 md:h-6 animate-pulse" />
        </div>
        <div className="flex-1">
          <h4 className="text-f1-red text-[10px] font-pixel mb-2 flex items-center gap-2">
            PIT WALL
            {loading && <span className="inline-block w-2 h-2 bg-white rounded-none animate-pulse"/>}
          </h4>
          
          {loading ? (
             <div className="flex items-center gap-2 text-gray-400 font-mono text-xs md:text-sm h-6">
                <Loader2 className="w-4 h-4 animate-spin text-f1-red" />
                <span>DECRYPTING RADIO MESSAGE...</span>
             </div>
          ) : (
            <p className="text-white font-mono text-sm md:text-lg leading-relaxed border-l-2 border-f1-red pl-3">
              "{data?.comment}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};