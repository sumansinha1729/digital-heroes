import { useEffect, useState } from "react";

const DURATION_MS = 800;

export function useCountUp(targetValue) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      setDisplayValue(Math.round(targetValue * progress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      }
    }

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue]);

  return displayValue;
}
