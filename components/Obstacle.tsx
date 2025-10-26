import React from 'react';
import type { ObstacleState } from '../types';
import { ObstacleType } from '../types';
import { LASER_CYCLE_DURATION, LASER_ACTIVE_DURATION } from '../constants';


interface ObstacleProps {
  obstacleState: ObstacleState;
}

const Obstacle: React.FC<ObstacleProps> = ({ obstacleState }) => {
   const style: React.CSSProperties = {
    left: `${obstacleState.x}px`,
    bottom: `${obstacleState.y}px`,
    width: `${obstacleState.width}px`,
    height: `${obstacleState.height}px`,
  };

  let obstacleClass = "absolute shadow-md ";
  let children = null;

  switch (obstacleState.type) {
    case ObstacleType.Wall:
      obstacleClass += "bg-gray-500 border-2 border-gray-700 rounded-md";
      style.bottom = 'auto'; // override bottom
      style.top = 0;
      break;
    case ObstacleType.Platform:
      obstacleClass += "bg-yellow-700 border-2 border-yellow-900 rounded-md";
      break;
    case ObstacleType.Drone:
      obstacleClass += "bg-red-700 border-2 border-red-900 rounded-full";
      // add a propeller
      children = <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 h-1 w-4/5 bg-gray-400 rounded-full animate-pulse" />;
      break;
    case ObstacleType.SpikePit:
      obstacleClass += "bg-gray-800";
      // simple triangle spikes
      children = (
          <div className="flex w-full h-full justify-around items-end">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-b-[20px] border-b-gray-500 border-r-[10px] border-r-transparent" />
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-b-[20px] border-b-gray-500 border-r-[10px] border-r-transparent" />
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-b-[20px] border-b-gray-500 border-r-[10px] border-r-transparent" />
          </div>
      )
      style.height = '20px'; // It's a pit on the ground
      break;
    case ObstacleType.LaserBeam:
        const animationDelay = `${-(obstacleState.id % LASER_CYCLE_DURATION)}ms`;
        style.animation = `pulse-laser ${LASER_CYCLE_DURATION}ms infinite ease-in-out`;
        style.animationDelay = animationDelay;
        return (
            <>
                <style>
                {`
                    @keyframes pulse-laser {
                        0% { background-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); }
                        ${(LASER_ACTIVE_DURATION / LASER_CYCLE_DURATION) * 100 - 1}% { background-color: rgba(239, 68, 68, 0.9); box-shadow: 0 0 25px rgba(239, 68, 68, 0.9); }
                        ${(LASER_ACTIVE_DURATION / LASER_CYCLE_DURATION) * 100}% { background-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); }
                        100% { background-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); }
                    }
                `}
                </style>
                <div className="absolute bg-red-500 rounded-full" style={style}></div>
            </>
        )
    case ObstacleType.Barrier:
    default:
      obstacleClass += "bg-green-600 border-2 border-green-800 rounded-md";
      break;
  }

  return (
    <div
      className={obstacleClass}
      style={style}
    >
      {children}
    </div>
  );
};

export default Obstacle;
