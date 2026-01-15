import React, { useState, useRef } from 'react';

const GridBackground: React.FC = () => {
  const cellsRef = useRef<Map<string, number>>(new Map());
  const [, forceRender] = useState(0);
  const [drawMode, setDrawMode] = useState<'add' | 'remove' | null>(null);
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  const lastPos = useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fadeDurationMs = 4500;

  const updateCells = (points: [number, number][], mode: 'add' | 'remove') => {
    const now = Date.now();
    const map = cellsRef.current;
    let changed = false;

    points.forEach(([x, y]) => {
      const key = `${x},${y}`;
      if (mode === 'add') {
        map.set(key, now);
        changed = true;
      } else if (map.has(key)) {
        map.delete(key);
        changed = true;
      }
    });

    if (changed) {
      forceRender((tick) => tick + 1);
    }
  };

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      const map = cellsRef.current;
      let changed = false;
      for (const [key, timestamp] of map) {
        if (now - timestamp >= fadeDurationMs) {
          map.delete(key);
          changed = true;
        }
      }
      if (changed) {
        forceRender((tick) => tick + 1);
      }
    }, 120);

    return () => window.clearInterval(interval);
  }, []);

  const getPointsOnLine = (x0: number, y0: number, x1: number, y1: number) => {
    const points: [number, number][] = [];
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
      points.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
    return points;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = Math.floor(e.clientX / 8);
    const y = Math.floor(e.clientY / 8);
    // Determine mode based on the clicked cell
    const key = `${x},${y}`;
    const mode = cellsRef.current.has(key) ? 'remove' : 'add';
    setDrawMode(mode);
    lastPos.current = { x, y };
    updateCells([[x, y]], mode);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawMode && lastPos.current) {
      const x = Math.floor(e.clientX / 8);
      const y = Math.floor(e.clientY / 8);

      if (x !== lastPos.current.x || y !== lastPos.current.y) {
        const points = getPointsOnLine(lastPos.current.x, lastPos.current.y, x, y);
        updateCells(points, drawMode);
        lastPos.current = { x, y };
      }
    }
  };

  const handleMouseUp = () => {
    setDrawMode(null);
    lastPos.current = null;
  };

  const handleMouseLeave = () => {
    setDrawMode(null);
    lastPos.current = null;
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent scrolling while drawing
    const touch = e.touches[0];
    const x = Math.floor(touch.clientX / 8);
    const y = Math.floor(touch.clientY / 8);
    const key = `${x},${y}`;
    const mode = cellsRef.current.has(key) ? 'remove' : 'add';
    setDrawMode(mode);
    lastPos.current = { x, y };
    updateCells([[x, y]], mode);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (drawMode && lastPos.current) {
      const touch = e.touches[0];
      const x = Math.floor(touch.clientX / 8);
      const y = Math.floor(touch.clientY / 8);

      if (x !== lastPos.current.x || y !== lastPos.current.y) {
        const points = getPointsOnLine(lastPos.current.x, lastPos.current.y, x, y);
        updateCells(points, drawMode);
        lastPos.current = { x, y };
      }
    }
  };

  const handleTouchEnd = () => {
    setDrawMode(null);
    lastPos.current = null;
  };

  const now = Date.now();

  return (
    <div
      className="fixed inset-0 h-screen w-screen"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        // zIndex: 0, // Ensure it's not buried too deep, but behind content if content has z-index
        backgroundImage: `
          linear-gradient(to right, rgba(110, 90, 85, 0.15) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(110, 90, 85, 0.15) 1px, transparent 1px)
        `,
        backgroundSize: '8px 8px',
      }}
    >
        {Array.from(cellsRef.current.entries()).map(([key, timestamp]) => {
            const [x, y] = key.split(',').map(Number);
            const age = now - timestamp;
            const opacity = Math.max(0, 1 - age / fadeDurationMs);
            return (
                <div
                    key={key}
                    className="absolute h-2 w-2"
                    style={{
                        left: x * 8,
                        top: y * 8,
                        backgroundColor: `rgba(62, 39, 35, ${opacity})`,
                    }}
                />
            );
        })}
        {/* Blinking Prompt */}
        <div className="pointer-events-none">
            {(() => {
                const rows = Math.floor(windowHeight / 8);
                const startX = 4;
                const startY = rows - 10; // Moved up to accommodate larger size

                // Shape for ">" (Larger 5-unit height)
                // *
                //  *
                //   *
                //  *
                // *
                const arrowCells = [
                    [startX, startY],
                    [startX + 1, startY + 1],
                    [startX + 2, startY + 2],
                    [startX + 1, startY + 3],
                    [startX, startY + 4],
                ];

                // Shape for "_" (Larger 4-unit width)
                const cursorCells = [
                    [startX + 4, startY + 4],
                    [startX + 5, startY + 4],
                    [startX + 6, startY + 4],
                    [startX + 7, startY + 4],
                ];

                return (
                    <>
                        {arrowCells.map(([x, y], i) => (
                            <div
                                key={`arrow-${i}`}
                                className="absolute h-2 w-2 bg-[#3e2723]"
                                style={{
                                    left: x * 8,
                                    top: y * 8,
                                }}
                            />
                        ))}
                        {cursorCells.map(([x, y], i) => (
                            <div
                                key={`cursor-${i}`}
                                className="absolute h-2 w-2 bg-[#3e2723] animate-[blink_1s_step-end_infinite]"
                                style={{
                                    left: x * 8,
                                    top: y * 8,
                                }}
                            />
                        ))}
                    </>
                );
            })()}
        </div>
    </div>
  );
};

export default GridBackground;
