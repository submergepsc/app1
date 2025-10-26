import React from 'react';
import type { PowerUpState } from '../types';
import { PowerUpType } from '../types';

interface PowerUpProps {
  powerUpState: PowerUpState;
}

const PowerUp: React.FC<PowerUpProps> = ({ powerUpState }) => {
   const style: React.CSSProperties = {
    left: `${powerUpState.x}px`,
    bottom: `${powerUpState.y}px`,
    width: `${powerUpState.width}px`,
    height: `${powerUpState.height}px`,
  };
  
  let content = null;
  let classes = "absolute rounded-full shadow-lg flex items-center justify-center";

  // Prevent animation for UI indicator
  if (powerUpState.id !== 0) {
    classes += " animate-bounce";
  }

  switch (powerUpState.type) {
    case PowerUpType.TimeSlow:
        classes += " bg-yellow-400 border-2 border-yellow-600";
        content = (
            <div className="w-full h-full relative flex flex-col items-center justify-center">
                <div className="w-0 h-0 border-x-[8px] border-x-transparent border-t-[10px] border-t-yellow-100" />
                <div className="w-0 h-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-yellow-100" />
            </div>
        );
        break;
    case PowerUpType.Shield:
    default:
        classes += " bg-cyan-400 border-2 border-cyan-600";
        content = <div className="w-1/2 h-1/2 bg-cyan-100 rounded-full" />;
        break;
  }
  
  return (
    <div
      className={classes}
      style={style}
    >
       {content}
    </div>
  );
};

export default PowerUp;