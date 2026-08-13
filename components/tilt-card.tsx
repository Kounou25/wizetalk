'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Inclinaison 3D discrete qui suit le curseur, remise a plat en sortie. */
export function TiltCard({
  children,
  className,
  maxTilt = 5,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * maxTilt * 2, y: px * maxTilt * 2 });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => {
        setActive(false);
        setTilt({ x: 0, y: 0 });
      }}
      className={cn('[perspective:1200px]', className)}
    >
      <div
        className="transition-transform duration-300 ease-out will-change-transform motion-reduce:transform-none"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${active ? 1.012 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}
