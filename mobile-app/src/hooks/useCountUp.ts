import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, duration = 1000) {
  const [val, setVal]   = useState(0);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    const startVal  = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(startVal + eased * (target - startVal));
      setVal(current);
      if (progress >= 1 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 16); // ~60fps

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target, duration]);

  return val;
}