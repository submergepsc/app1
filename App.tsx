import React, { useState, useEffect, useCallback } from 'react';
import Game from './components/Game';
import { GameStatus } from './types';
import { PLAYER_INITIAL_LIVES } from './constants';

const HeartIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="m11.645 20.91-1.106-1.007C5.373 15.253 2 12.279 2 8.5C2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.779-3.373 6.753-8.54 11.402L11.645 20.91Z" />
    </svg>
);


const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Waiting);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(PLAYER_INITIAL_LIVES);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('parkourHighScore');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  const handleGameEnd = useCallback(() => {
    setGameStatus(GameStatus.GameOver);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('parkourHighScore', score.toString());
    }
  }, [highScore, score]);
  
  const handleSetGameStatus = useCallback((status: GameStatus) => {
    if (status === GameStatus.GameOver) {
      handleGameEnd();
    } else {
      setGameStatus(status);
    }
  }, [handleGameEnd]);

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setLives(PLAYER_INITIAL_LIVES);
    setGameStatus(GameStatus.Playing);
  };
  
  const renderLives = () => {
    return Array.from({ length: PLAYER_INITIAL_LIVES }).map((_, i) => (
        <HeartIcon key={i} className={`w-8 h-8 ${i < lives ? 'text-red-500' : 'text-gray-600'}`} />
    ));
  }

  const renderContent = () => {
    switch (gameStatus) {
      case GameStatus.Playing:
        return <Game setGameStatus={handleSetGameStatus} setScore={setScore} setLevel={setLevel} setLives={setLives} initialLives={PLAYER_INITIAL_LIVES}/>;
      case GameStatus.GameOver:
        return (
          <div className="flex flex-col items-center justify-center text-white text-center p-8 rounded-lg bg-black/70 backdrop-blur-sm z-20">
            <h1 className="text-5xl font-extrabold text-red-500 mb-4">Game Over</h1>
            <p className="text-2xl mb-2">Your Score: <span className="font-bold text-yellow-400">{score}</span></p>
            <p className="text-xl mb-6">High Score: <span className="font-bold text-yellow-400">{highScore}</span></p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 active:bg-green-700 transform hover:scale-105 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        );
      case GameStatus.Waiting:
      default:
        return (
          <div className="flex flex-col items-center justify-center text-white text-center p-8 rounded-lg bg-black/70 backdrop-blur-sm z-20">
            <h1 className="text-6xl font-extrabold text-blue-400 mb-4 tracking-wider">React Parkour</h1>
            <p className="text-xl mb-6 max-w-md">
                Jump with <span className="font-bold text-yellow-300 p-1 bg-gray-700 rounded">Space</span> / <span className="font-bold text-yellow-300">Tap</span>.
                <br />
                Slide with <span className="font-bold text-yellow-300 p-1 bg-gray-700 rounded">Down Arrow</span> / <span className="font-bold text-yellow-300 p-1 bg-gray-700 rounded">S</span>.
            </p>
            <button
              onClick={startGame}
              className="px-10 py-5 bg-blue-500 text-white font-bold text-2xl rounded-lg shadow-lg hover:bg-blue-600 active:bg-blue-700 transform hover:scale-105 transition-all duration-200"
            >
              Start Game
            </button>
            <p className="mt-8 text-sm text-gray-400">High Score: {highScore}</p>
          </div>
        );
    }
  };

  return (
    <main className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-mono select-none overflow-hidden">
        <div className="absolute top-4 left-4 text-white text-2xl font-bold z-10 p-2 bg-black/50 rounded-md">
            Score: {score}
        </div>
        <div className="absolute top-4 right-4 text-white text-2xl font-bold z-10 p-2 bg-black/50 rounded-md">
            High Score: {highScore}
        </div>
        <div className="absolute top-16 right-4 text-white text-xl font-bold z-10 p-2 bg-black/50 rounded-md flex items-center gap-1">
            {renderLives()}
        </div>
        <div className="absolute top-16 left-4 text-white text-xl font-bold z-10 p-2 bg-black/50 rounded-md">
            Level: {level}
        </div>
        {renderContent()}
    </main>
  );
};

export default App;
