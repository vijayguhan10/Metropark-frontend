import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const TimerComponent = ({ initialMinutes = 15 }) => {
  const [countdown, setCountdown] = useState(initialMinutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(countdown / 60).toString().padStart(2, '0');
  const seconds = (countdown % 60).toString().padStart(2, '0');

  return (
    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/50 rounded-full">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-violet animate-pulse" />
        <Timer className="w-4 h-4 text-violet" />
      </div>
      <span className="text-label-md font-mono font-bold text-on-surface tabular-nums">
        {minutes}:{seconds}
      </span>
      <span className="text-label-sm text-on-surface-variant">remaining</span>
    </div>
  );
};

export default TimerComponent;