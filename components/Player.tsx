import React from 'react';
import type { PlayerState } from '../types';
import { PlayerStatus, PowerUpType } from '../types';

interface PlayerProps {
  playerState: PlayerState;
}

const Player: React.FC<PlayerProps> = ({ playerState }) => {
  const style: React.CSSProperties = {
    left: `${playerState.x}px`,
    bottom: `${playerState.y}px`,
    width: `${playerState.width}px`,
    height: `${playerState.height}px`,
    transition: 'height 150ms ease-out, background-color 150ms ease-out',
  };

  const isSliding = playerState.status === PlayerStatus.Sliding;
  const isHit = playerState.status === PlayerStatus.Hit;
  const hasShield = playerState.activePowerUp === PowerUpType.Shield;

  let playerClasses = `absolute rounded-t-md shadow-lg border-2 z-10 `;
  
  if (isSliding) {
    playerClasses += 'bg-purple-500 border-purple-700';
  } else if (isHit) {
    playerClasses += 'bg-red-500 border-red-700 animate-pulse';
  } else {
    playerClasses += 'bg-blue-500 border-blue-700';
  }

  return (
    <div
      className={playerClasses}
      style={style}
      data-testid="player"
    >
      {hasShield && (
        <div className="absolute inset-[-8px] border-4 border-cyan-400 rounded-full animate-pulse bg-cyan-400/30"></div>
      )}
    </div>
  );
};

export default Player;
