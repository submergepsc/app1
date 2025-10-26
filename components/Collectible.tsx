import React from 'react';
import type { CollectibleState } from '../types';

interface CollectibleProps {
  collectibleState: CollectibleState;
}

const Collectible: React.FC<CollectibleProps> = ({ collectibleState }) => {
   const style: React.CSSProperties = {
    left: `${collectibleState.x}px`,
    bottom: `${collectibleState.y}px`,
    width: `${collectibleState.width}px`,
    height: `${collectibleState.height}px`,
  };
  
  return (
    <div
      className="absolute bg-yellow-400 border-2 border-yellow-600 rounded-full shadow-lg flex items-center justify-center"
      style={style}
    >
        <div className="text-yellow-800 font-bold text-sm">$</div>
    </div>
  );
};

export default Collectible;
