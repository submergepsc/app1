import { useCallback, useEffect, useRef } from 'react';

export const useGameLoop = (callback: (deltaTime: number) => void, running: boolean) => {
  // FIX: `useRef` was called without an initial value, which is required. Initialize with `undefined`.
  const requestRef = useRef<number | undefined>(undefined);
  // FIX: `useRef` was called without an initial value, which is required. Initialize with `undefined`.
  const previousTimeRef = useRef<number | undefined>(undefined);

  const loop = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(loop);
  }, [callback]);

  useEffect(() => {
    if (running) {
      requestRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      previousTimeRef.current = undefined;
    };
  }, [running, loop]);
};
