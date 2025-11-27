import React from 'react';

interface F1LightsProps {
  activeLights: number; // 0 to 5
  areLightsOut: boolean;
}

export const F1Lights: React.FC<F1LightsProps> = ({ activeLights, areLightsOut }) => {
  // Create an array of 5 items to represent the 5 columns of lights
  const lights = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="bg-f1-carbon p-4 md:p-8 rounded-2xl shadow-2xl border-b-4 border-gray-700 w-full max-w-3xl mx-auto mb-8">
      <div className="flex justify-between items-center gap-2 md:gap-4">
        {lights.map((lightIndex) => {
          const isOn = !areLightsOut && activeLights >= lightIndex;
          
          return (
            <div key={lightIndex} className="flex flex-col items-center gap-2 md:gap-4 bg-black/40 p-2 md:p-4 rounded-lg flex-1">
              {/* The Lights */}
              <div 
                className={`
                  w-12 h-12 md:w-20 md:h-20 rounded-full border-4 border-black transition-all duration-75
                  ${isOn 
                    ? 'bg-f1-red shadow-[0_0_30px_rgba(255,24,1,0.6)] scale-105' 
                    : 'bg-[#2a2a2a]'
                  }
                `}
              />
              <div 
                 className={`
                 w-12 h-12 md:w-20 md:h-20 rounded-full border-4 border-black transition-all duration-75
                 ${isOn 
                   ? 'bg-f1-red shadow-[0_0_30px_rgba(255,24,1,0.6)] scale-105' 
                   : 'bg-[#2a2a2a]'
                 }
               `}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};