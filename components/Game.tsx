import React, { useState, useEffect, useCallback, useRef } from 'react';
import Player from './Player';
import Obstacle from './Obstacle';
import Collectible from './Collectible';
import PowerUp from './PowerUp';
import { useGameLoop } from '../hooks/useGameLoop';
import { GameStatus, PlayerStatus, ObstacleType, PowerUpType } from '../types';
import type { PlayerState, ObstacleState, CollectibleState, PowerUpState } from '../types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SLIDING_HEIGHT,
  PLAYER_INITIAL_X,
  PLAYER_INVINCIBILITY_DURATION,
  GRAVITY,
  JUMP_STRENGTH,
  SLIDE_DURATION,
  LEVELS,
  OBSTACLE_MIN_WIDTH,
  OBSTACLE_MAX_WIDTH,
  OBSTACLE_MIN_HEIGHT,
  OBSTACLE_MAX_HEIGHT,
  WALL_HEIGHT,
  PLATFORM_Y,
  PLATFORM_HEIGHT,
  DRONE_WIDTH,
  DRONE_HEIGHT,
  DRONE_Y_AMPLITUDE,
  DRONE_Y_FREQUENCY,
  SPIKE_PIT_WIDTH_MIN,
  SPIKE_PIT_WIDTH_MAX,
  LASER_WIDTH,
  LASER_HEIGHT,
  LASER_CYCLE_DURATION,
  LASER_ACTIVE_DURATION,
  COIN_WIDTH,
  COIN_HEIGHT,
  COIN_SCORE_VALUE,
  COIN_SPAWN_CHANCE,
  POWERUP_WIDTH,
  POWERUP_HEIGHT,
  POWERUP_SPAWN_CHANCE,
  TIME_SLOW_DURATION,
  TIME_SLOW_FACTOR
} from '../constants';

interface GameProps {
  setGameStatus: (status: GameStatus) => void;
  setScore: (score: number) => void;
  setLevel: (level: number) => void;
  setLives: (lives: number) => void;
  initialLives: number;
}

const Game: React.FC<GameProps> = ({ setGameStatus, setScore, setLevel, setLives, initialLives }) => {
  const [player, setPlayer] = useState<PlayerState>({
    x: PLAYER_INITIAL_X,
    y: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    velocityY: 0,
    status: PlayerStatus.Running,
    slideTimer: 0,
    lives: initialLives,
    invincibilityTimer: 0,
    activePowerUp: null,
    timeSlowTimer: 0,
  });

  const [obstacles, setObstacles] = useState<ObstacleState[]>([]);
  const [collectibles, setCollectibles] = useState<CollectibleState[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUpState[]>([]);
  const [internalScore, setInternalScore] = useState(0);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [levelConfig, setLevelConfig] = useState(LEVELS[0]);
  const [obstacleSpeed, setObstacleSpeed] = useState(levelConfig.speed);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const lastSpawnTimeRef = useRef(0);
  const nextSpawnIntervalRef = useRef(Math.random() * (levelConfig.spawnIntervalMax - levelConfig.spawnIntervalMin) + levelConfig.spawnIntervalMin);
  const gameTimeRef = useRef(0);
  const nextId = useRef(0);
  
  const spawnItems = useCallback(() => {
    const random = Math.random();
    const allowedPowerUps = levelConfig.allowedPowerUps;
    // Try to spawn a power-up first (since it's rarest)
    if (allowedPowerUps.length > 0 && random < POWERUP_SPAWN_CHANCE) {
        const type = allowedPowerUps[Math.floor(Math.random() * allowedPowerUps.length)];
        setPowerUps(prev => [...prev, {
            id: nextId.current++,
            x: GAME_WIDTH,
            y: 150,
            width: POWERUP_WIDTH,
            height: POWERUP_HEIGHT,
            type,
        }]);
    } 
    // If not a power-up, try for a coin
    else if (currentLevelIndex > 0 && random < POWERUP_SPAWN_CHANCE + COIN_SPAWN_CHANCE) {
        const coinY = Math.random() > 0.5 ? 20 : 120; // Two possible heights for coins
        setCollectibles(prev => [...prev, {
            id: nextId.current++,
            x: GAME_WIDTH,
            y: coinY,
            width: COIN_WIDTH,
            height: COIN_HEIGHT
        }]);
    }


    const obstacleTypes = levelConfig.allowedObstacles;
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    let width, height, y, initialY;

    switch (type) {
      case ObstacleType.Wall:
        width = Math.floor(Math.random() * (OBSTACLE_MAX_WIDTH - OBSTACLE_MIN_WIDTH + 1)) + OBSTACLE_MIN_WIDTH;
        height = WALL_HEIGHT;
        y = GAME_HEIGHT - WALL_HEIGHT; // hangs from top
        initialY = y;
        break;
      case ObstacleType.Platform:
        width = Math.floor(Math.random() * (OBSTACLE_MAX_WIDTH - OBSTACLE_MIN_WIDTH + 1)) + OBSTACLE_MIN_WIDTH;
        height = PLATFORM_HEIGHT;
        y = PLATFORM_Y;
        initialY = y;
        break;
      case ObstacleType.Drone:
        width = DRONE_WIDTH;
        height = DRONE_HEIGHT;
        y = GAME_HEIGHT / 2;
        initialY = y;
        break;
      case ObstacleType.SpikePit:
        width = Math.floor(Math.random() * (SPIKE_PIT_WIDTH_MAX - SPIKE_PIT_WIDTH_MIN + 1)) + SPIKE_PIT_WIDTH_MIN;
        height = 20; // Visual height of spikes
        y = 0;
        initialY = y;
        break;
      case ObstacleType.LaserBeam:
        width = LASER_WIDTH;
        height = LASER_HEIGHT;
        y = 48; // Sits on top of the ground
        initialY = y;
        break;
      case ObstacleType.Barrier:
      default:
        width = Math.floor(Math.random() * (OBSTACLE_MAX_WIDTH - OBSTACLE_MIN_WIDTH + 1)) + OBSTACLE_MIN_WIDTH;
        height = Math.floor(Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT + 1)) + OBSTACLE_MIN_HEIGHT;
        y = 0;
        initialY = y;
        break;
    }

    setObstacles((prev) => [
      ...prev,
      { id: nextId.current++, x: GAME_WIDTH, y, width, height, type, initialY },
    ]);
  }, [levelConfig, currentLevelIndex]);

  const handleJump = useCallback(() => {
    setPlayer((p) => (p.y === 0 && p.status !== PlayerStatus.Sliding && p.status !== PlayerStatus.Hit ? { ...p, velocityY: JUMP_STRENGTH } : p));
  }, []);

  const handleSlide = useCallback(() => {
    setPlayer((p) => (p.y === 0 && p.status !== PlayerStatus.Hit ? { ...p, status: PlayerStatus.Sliding, slideTimer: SLIDE_DURATION, height: PLAYER_SLIDING_HEIGHT } : p));
  }, []);

  const handleTimeSlow = useCallback(() => {
    setPlayer(p => {
        if (p.activePowerUp === PowerUpType.TimeSlow) {
            return { ...p, activePowerUp: null, timeSlowTimer: TIME_SLOW_DURATION };
        }
        return p;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Escape') {
        setIsPaused(p => !p);
      }
      if (isPaused) return;

      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleSlide();
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        handleTimeSlow();
      }
    };
    
    const handleTouchStart = (e: TouchEvent) => {
        if (isPaused) return;
        e.preventDefault();
        handleJump();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleJump, handleSlide, handleTimeSlow, isPaused]);

  const gameLoopCallback = useCallback((deltaTime: number) => {
    const timeMultiplier = player.timeSlowTimer > 0 ? TIME_SLOW_FACTOR : 1;
    const elapsed = deltaTime * timeMultiplier;
    
    gameTimeRef.current += deltaTime;

    // 1. Update Player
    setPlayer(p => {
      let { y, velocityY, status, slideTimer, height, invincibilityTimer, activePowerUp, timeSlowTimer } = p;
      
      // Power-up timers (run on real time, not slowed time)
      if (timeSlowTimer > 0) {
        timeSlowTimer -= deltaTime;
      }
      if (invincibilityTimer > 0) {
        invincibilityTimer -= deltaTime;
        status = PlayerStatus.Hit;
      } else if (status === PlayerStatus.Hit) {
        status = PlayerStatus.Running;
      }

      // Jumping physics
      velocityY = velocityY + (GRAVITY * timeMultiplier);
      y = y - (velocityY * timeMultiplier);
      if (y <= 0) {
        y = 0;
        velocityY = 0;
        if (status === PlayerStatus.Jumping) {
            status = PlayerStatus.Running;
        }
      } else if (status !== PlayerStatus.Hit) { // don't override hit status
        status = PlayerStatus.Jumping;
      }
      
      // Sliding
      if (status === PlayerStatus.Sliding) {
        slideTimer -= elapsed;
        if (slideTimer <= 0) {
          status = PlayerStatus.Running;
          height = PLAYER_HEIGHT;
        }
      }
      
      if (y === 0 && status !== PlayerStatus.Sliding && status !== PlayerStatus.Hit) {
        status = PlayerStatus.Running;
        height = PLAYER_HEIGHT;
      }
      
      return { ...p, y, velocityY, status, slideTimer, height, invincibilityTimer, activePowerUp, timeSlowTimer };
    });
    
    const currentSpeed = obstacleSpeed * timeMultiplier;
    
    // 2. Update Movable Entities
    // FIX: The generic `moveEntity` function caused TypeScript to lose type information.
    // Replaced it with explicit inline object spreading to ensure correct type inference.
    const isVisible = (entity: {x: number, width: number}) => entity.x + entity.width > 0;
    
    setObstacles(prev => prev.map(obs => {
      const newObs = { ...obs, x: obs.x - currentSpeed };
      if (obs.type === ObstacleType.Drone) {
        newObs.y = obs.initialY + Math.sin(gameTimeRef.current * DRONE_Y_FREQUENCY) * DRONE_Y_AMPLITUDE;
      }
      return newObs;
    }).filter(isVisible));
    setCollectibles(prev => prev.map(collectible => ({ ...collectible, x: collectible.x - currentSpeed })).filter(isVisible));
    setPowerUps(prev => prev.map(powerUp => ({ ...powerUp, x: powerUp.x - currentSpeed })).filter(isVisible));


    // 3. Spawn new items
    lastSpawnTimeRef.current += elapsed;
    if (lastSpawnTimeRef.current > nextSpawnIntervalRef.current) {
      spawnItems();
      lastSpawnTimeRef.current = 0;
      nextSpawnIntervalRef.current = Math.random() * (levelConfig.spawnIntervalMax - levelConfig.spawnIntervalMin) + levelConfig.spawnIntervalMin;
    }
    
    // 4. Update Score, Speed, and Level
    setInternalScore(s => {
        const newScore = s + elapsed * 0.01;
        setScore(Math.floor(newScore));

        const nextLevelIndex = LEVELS.findIndex(l => newScore < l.scoreThreshold) - 1;
        const potentialNewLevel = nextLevelIndex >= 0 ? nextLevelIndex : LEVELS.length - 1;
        if (potentialNewLevel > currentLevelIndex) {
            setCurrentLevelIndex(potentialNewLevel);
            const newLevelConfig = LEVELS[potentialNewLevel];
            setLevelConfig(newLevelConfig);
            setLevel(newLevelConfig.level);
            setObstacleSpeed(newLevelConfig.speed);
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 1500);
        }
        return newScore;
    });
    
    // 5. Collision Detection
    setPlayer(p => {
        let playerHit = false;
        // Obstacle collision
        if (p.invincibilityTimer <= 0) {
            for (const obs of obstacles) {
                let collision = false;
                if (obs.type === ObstacleType.SpikePit) {
                    collision = p.y === 0 && p.x < obs.x + obs.width && p.x + p.width > obs.x;
                } else if (obs.type === ObstacleType.LaserBeam) {
                    const timeInCycle = gameTimeRef.current % LASER_CYCLE_DURATION;
                    const isLaserActive = timeInCycle < LASER_ACTIVE_DURATION;
                    if (isLaserActive) {
                        collision = p.x < obs.x + obs.width && p.x + p.width > obs.x && p.y < obs.y + obs.height && p.y + p.height > obs.y;
                    }
                } else {
                    collision = p.x < obs.x + obs.width && p.x + p.width > obs.x && p.y < obs.y + obs.height && p.y + p.height > obs.y;
                }

                if (collision) {
                    if (p.activePowerUp === PowerUpType.Shield) {
                        return { ...p, activePowerUp: null, invincibilityTimer: 500 };
                    }
                    playerHit = true;
                    break;
                }
            }
        }
        
        if (playerHit) {
            const newLives = p.lives - 1;
            setLives(newLives);
            if (newLives <= 0) {
                setGameStatus(GameStatus.GameOver);
            }
            return { ...p, lives: newLives, invincibilityTimer: PLAYER_INVINCIBILITY_DURATION, status: PlayerStatus.Hit, timeSlowTimer: 0 };
        }
        
        // Collectible/PowerUp collision
        const collectedCoinIds = new Set<number>();
        const collectedPowerUpIds = new Set<number>();
        
        for (const coin of collectibles) {
             if (p.x < coin.x + coin.width && p.x + p.width > coin.x && p.y < coin.y + coin.height && p.y + p.height > coin.y) {
                collectedCoinIds.add(coin.id);
                setInternalScore(s => s + COIN_SCORE_VALUE);
            }
        }
        
        let newPowerUp = p.activePowerUp;
        if (!p.activePowerUp) { // Can't pick up a new one if you already hold one
            for (const powerUp of powerUps) {
                 if (p.x < powerUp.x + powerUp.width && p.x + p.width > powerUp.x && p.y < powerUp.y + powerUp.height && p.y + p.height > powerUp.y) {
                    collectedPowerUpIds.add(powerUp.id);
                    newPowerUp = powerUp.type;
                }
            }
        }
        
        if (collectedCoinIds.size > 0) {
            setCollectibles(prev => prev.filter(c => !collectedCoinIds.has(c.id)));
        }
        if (collectedPowerUpIds.size > 0) {
            setPowerUps(prev => prev.filter(pu => !collectedPowerUpIds.has(pu.id)));
            return { ...p, activePowerUp: newPowerUp };
        }

        return p;
    });

  }, [player.timeSlowTimer, obstacleSpeed, obstacles, collectibles, powerUps, setGameStatus, setScore, spawnItems, levelConfig, currentLevelIndex, setLevel, setLives]);

  useGameLoop(gameLoopCallback, !isPaused);
  
  const timeSlowActive = player.timeSlowTimer > 0;

  return (
    <div
      className={`relative w-full h-full bg-gradient-to-b ${levelConfig.bgColor} overflow-hidden border-4 border-gray-800 rounded-lg shadow-2xl transition-all duration-1000`}
      style={{
        maxWidth: `${GAME_WIDTH}px`,
        maxHeight: `${GAME_HEIGHT}px`,
        aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`
      }}
    >
        <div className={`absolute inset-0 z-20 transition-all duration-300 ${timeSlowActive ? 'backdrop-blur-sm bg-blue-500/20' : 'pointer-events-none'}`} />

        {isPaused && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-white">
                <h2 className="text-5xl font-extrabold mb-8">Paused</h2>
                <button 
                    onClick={() => setIsPaused(false)}
                    className="px-8 py-4 mb-4 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 active:bg-green-700 transform hover:scale-105 transition-all duration-200"
                >
                    Resume
                </button>
                <button 
                    onClick={() => setGameStatus(GameStatus.Waiting)}
                    className="px-8 py-4 bg-red-500 text-white font-bold rounded-lg shadow-lg hover:bg-red-600 active:bg-red-700 transform hover:scale-105 transition-all duration-200"
                >
                    Main Menu
                </button>
            </div>
        )}

        {showLevelUp && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <h2 className="text-6xl font-extrabold text-white text-center animate-ping">
              Level {levelConfig.level}!
            </h2>
             <h2 className="absolute text-6xl font-extrabold text-yellow-300 text-center" style={{textShadow: '2px 2px 4px #000'}}>
              Level {levelConfig.level}!
            </h2>
          </div>
        )}
        
        {/* Power-up held indicator */}
        {player.activePowerUp && (
            <div className="absolute bottom-4 left-4 z-30 bg-black/50 p-2 rounded-lg flex items-center gap-2 text-white">
                <span className="font-bold">Ready:</span>
                <div className="w-8 h-8"><PowerUp powerUpState={{id: 0, x:0, y:0, width:30, height:30, type: player.activePowerUp}} /></div>
            </div>
        )}

        <div className="absolute bottom-0 left-0 w-full h-12 bg-lime-600 border-t-4 border-lime-800" />
        <Player playerState={player} />
        {obstacles.map((obs) => (
            <Obstacle key={obs.id} obstacleState={obs} />
        ))}
        {collectibles.map((coin) => (
            <Collectible key={coin.id} collectibleState={coin} />
        ))}
        {powerUps.map((powerUp) => (
            <PowerUp key={powerUp.id} powerUpState={powerUp} />
        ))}
    </div>
  );
};

export default Game;