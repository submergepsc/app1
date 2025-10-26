import { ObstacleType, PowerUpType } from './types';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 60;
export const PLAYER_SLIDING_HEIGHT = 30;
export const PLAYER_INITIAL_X = 50;
export const PLAYER_INITIAL_LIVES = 3;
export const PLAYER_INVINCIBILITY_DURATION = 1500; // in ms

export const GRAVITY = 0.8;
export const JUMP_STRENGTH = -18;
export const SLIDE_DURATION = 400; // in milliseconds

export const COIN_WIDTH = 25;
export const COIN_HEIGHT = 25;
export const COIN_SCORE_VALUE = 50;
export const COIN_SPAWN_CHANCE = 0.2;

export const POWERUP_WIDTH = 30;
export const POWERUP_HEIGHT = 30;
export const POWERUP_SPAWN_CHANCE = 0.08; // Chance for ANY power-up

export const TIME_SLOW_DURATION = 5000; // 5 seconds
export const TIME_SLOW_FACTOR = 0.5; // 50% speed

// Obstacle base properties
export const OBSTACLE_MIN_WIDTH = 30;
export const OBSTACLE_MAX_WIDTH = 80;
export const OBSTACLE_MIN_HEIGHT = 40;
export const OBSTACLE_MAX_HEIGHT = 100;

// Specific obstacle properties
export const WALL_HEIGHT = 120;
export const PLATFORM_Y = 100; // Height of the platform from the ground
export const PLATFORM_HEIGHT = 20;
export const DRONE_WIDTH = 50;
export const DRONE_HEIGHT = 30;
export const DRONE_Y_AMPLITUDE = 80; // How far up/down it moves
export const DRONE_Y_FREQUENCY = 0.005; // Speed of vertical movement
export const SPIKE_PIT_WIDTH_MIN = 60;
export const SPIKE_PIT_WIDTH_MAX = 120;
export const LASER_WIDTH = 15;
export const LASER_HEIGHT = GAME_HEIGHT - 48; // Ground height
export const LASER_CYCLE_DURATION = 3000; // 3 seconds for a full on/off cycle
export const LASER_ACTIVE_DURATION = 1000; // Stays on for 1s

export const LEVELS = [
  {
    scoreThreshold: 0,
    level: 1,
    speed: 8,
    spawnIntervalMin: 1200,
    spawnIntervalMax: 2500,
    allowedObstacles: [ObstacleType.Barrier],
    allowedPowerUps: [],
    bgColor: 'from-sky-400 to-sky-600',
    name: "Urban Park",
  },
  {
    scoreThreshold: 750,
    level: 2,
    speed: 10,
    spawnIntervalMin: 900,
    spawnIntervalMax: 2000,
    allowedObstacles: [ObstacleType.Barrier, ObstacleType.Wall, ObstacleType.SpikePit],
    allowedPowerUps: [PowerUpType.Shield],
    bgColor: 'from-orange-400 to-orange-600',
    name: "Construction Zone",
  },
  {
    scoreThreshold: 2000,
    level: 3,
    speed: 13,
    spawnIntervalMin: 700,
    spawnIntervalMax: 1600,
    allowedObstacles: [ObstacleType.Barrier, ObstacleType.Wall, ObstacleType.Platform, ObstacleType.Drone, ObstacleType.SpikePit],
    allowedPowerUps: [PowerUpType.Shield, PowerUpType.TimeSlow],
    bgColor: 'from-indigo-700 to-indigo-900',
    name: "Rooftop Rush",
  },
  {
    scoreThreshold: 4000,
    level: 4,
    speed: 16,
    spawnIntervalMin: 600,
    spawnIntervalMax: 1300,
    allowedObstacles: [ObstacleType.Wall, ObstacleType.Drone, ObstacleType.SpikePit, ObstacleType.LaserBeam],
    allowedPowerUps: [PowerUpType.Shield, PowerUpType.TimeSlow],
    bgColor: 'from-red-800 to-gray-900',
    name: "Laser Labyrinth",
  }
];