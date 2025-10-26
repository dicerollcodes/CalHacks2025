import { useState, useEffect } from 'react';

/**
 * Custom hook for count-up animation
 * @param {number} end - The final number to count up to
 * @param {number} duration - Duration of animation in milliseconds
 * @param {number} delay - Delay before starting animation in milliseconds
 * @returns {number} The current animated value
 */
export function useCountUp(end, duration = 1500, delay = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now() + delay;
    const endTime = startTime + duration;

    const timer = setInterval(() => {
      const now = Date.now();

      if (now < startTime) {
        return; // Still in delay period
      }

      if (now >= endTime) {
        setCount(end);
        clearInterval(timer);
        return;
      }

      const progress = (now - startTime) / duration;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4); // Ease-out animation
      const currentCount = Math.floor(easeOutQuart * end);

      setCount(currentCount);
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [end, duration, delay]);

  return count;
}
