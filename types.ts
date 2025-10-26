export enum GameStatus {
  Waiting,
  Playing,
  GameOver,
}

export enum PlayerStatus {
  Running,
  Jumping,
  Sliding,
  Hit, // For invincibility period
}

export enum ObstacleType {
  Barrier,    // Jump over
  Wall,       // Slide under
  Platform,   // Jump on
  Drone,      // Moves up and down
  SpikePit,   // A gap in the floor
  LaserBeam,  // A vertical, pulsing laser
}

export enum PowerUpType {
  Shield,
  TimeSlow,
}

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  status: PlayerStatus;
  slideTimer: number;
  lives: number;
  invincibilityTimer: number;
  activePowerUp: PowerUpType | null;
  timeSlowTimer: number;
}

export interface ObstacleState {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  initialY: number; // For drone vertical movement
}

export interface CollectibleState {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PowerUpState {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PowerUpType;
}