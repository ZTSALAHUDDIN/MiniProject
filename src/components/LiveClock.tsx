import { useState, useEffect } from 'react';

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Clock hand angles
  const secondAngle = (seconds / 60) * 360;
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360;
  const hourAngle = (((hours % 12) + minutes / 60) / 12) * 360;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Analog Clock */}
      <div className="relative w-40 h-40 rounded-full border-4 border-primary/20 bg-card shadow-elevated">
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-3 bg-foreground/30 rounded-full"
            style={{
              top: '8px',
              left: '50%',
              transform: `translateX(-50%) rotate(${i * 30}deg)`,
              transformOrigin: '50% 72px',
            }}
          />
        ))}
        {/* Hour hand */}
        <div
          className="absolute bottom-1/2 left-1/2 w-1.5 h-10 bg-foreground rounded-full origin-bottom"
          style={{ transform: `translateX(-50%) rotate(${hourAngle}deg)` }}
        />
        {/* Minute hand */}
        <div
          className="absolute bottom-1/2 left-1/2 w-1 h-14 bg-primary rounded-full origin-bottom"
          style={{ transform: `translateX(-50%) rotate(${minuteAngle}deg)` }}
        />
        {/* Second hand */}
        <div
          className="absolute bottom-1/2 left-1/2 w-0.5 h-16 bg-destructive rounded-full origin-bottom"
          style={{ transform: `translateX(-50%) rotate(${secondAngle}deg)` }}
        />
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 -mt-1.5 -ml-1.5 bg-primary rounded-full shadow-glow" />
      </div>

      {/* Digital display */}
      <div className="text-center">
        <div className="font-heading font-bold text-2xl text-foreground">
          {displayHours.toString().padStart(2, '0')}
          <span className="animate-pulse">:</span>
          {minutes.toString().padStart(2, '0')}
          <span className="text-lg text-muted-foreground ml-1">{period}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
      </div>
    </div>
  );
}
