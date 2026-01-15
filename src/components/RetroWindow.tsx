import { useState, useEffect, useRef } from 'react';

interface RetroWindowProps {
  title?: string;
  children?: React.ReactNode;
  initialPosition?: { x: number; y: number };
  defaultAlignment?: 'center' | 'top-right' | 'top-left';
  minHeight?: number;
  minWidth?: number;
  height?: number;
  width?: number;
  onClose?: () => void;
  zIndex?: number;
  onFocus?: () => void;
  windowId?: string;
}

export default function RetroWindow({
  title = "System",
  children,
  initialPosition,
  defaultAlignment = 'center',
  minHeight = 200,
  minWidth = 300,
  height,
  width,
  onClose,
  zIndex,
  onFocus,
  windowId
}: RetroWindowProps) {
  // If initialPosition is provided, we don't use alignment
  const [alignment, setAlignment] = useState<string | null>(initialPosition ? null : defaultAlignment);
  // Snap initial position to 8px grid
  const [position, setPosition] = useState(
    initialPosition
      ? { x: Math.round(initialPosition.x / 8) * 8, y: Math.round(initialPosition.y / 8) * 8 }
      : { x: 0, y: 0 }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(position);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    width && height ? { width, height } : null
  );
  const resizeState = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Physics state refs for smooth sway animation
  const physicsState = useRef({
    velocity: 0,       // Current horizontal velocity of the mouse
    rotation: 0,       // Current rotation angle
    angularVel: 0,     // Current angular velocity
    lastMouseX: 0,
    lastTime: 0
  });

  useEffect(() => {
    let animationFrameId: number;

    const updatePhysics = (time: number) => {
      const state = physicsState.current;
      // Initialize lastTime if 0
      if (state.lastTime === 0) state.lastTime = time;

      const dt = Math.min((time - state.lastTime) / 1000, 0.1); // Cap dt to prevent huge jumps
      state.lastTime = time;

      // Physics Constants - Tweak these for "feel"
      const TENSION = 150;      // Spring stiffness (restoring force)
      const FRICTION = 12;      // Damping (resistance)
      const MAX_ROTATION = 10;  // Max tilt in degrees
      const SENSITIVITY = 0.15; // How much mouse speed affects tilt

      // Calculate target rotation based on horizontal velocity
      // Negative multiplier makes the bottom "drag" behind the top
      let targetRotation = state.velocity * -SENSITIVITY;

      // Clamp target rotation
      targetRotation = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, targetRotation));

      // If not dragging, we just want to settle to 0
      // In fact, the spring physics handles returning to 0 automatically
      // because state.velocity decays to 0.
      if (!isDragging && Math.abs(state.velocity) < 0.1) {
         targetRotation = 0;
      }

      // Spring force: F = -k * x
      // Here x is displacement from target
      const displacement = state.rotation - targetRotation;
      const springForce = -TENSION * displacement;

      // Damping force: F = -c * v
      const dampingForce = -FRICTION * state.angularVel;

      // Acceleration
      const acceleration = springForce + dampingForce;

      // Euler integration
      state.angularVel += acceleration * dt;
      state.rotation += state.angularVel * dt;

      // Decay input velocity (simulates friction on the "input" when mouse stops moving but is still held)
      state.velocity *= 0.85;
      if (Math.abs(state.velocity) < 0.01) state.velocity = 0;

      // Optimization: Stop loop if idle (not dragging AND effectively settled at 0)
      const isSettled = !isDragging &&
                        Math.abs(state.rotation) < 0.01 &&
                        Math.abs(state.angularVel) < 0.01 &&
                        Math.abs(state.velocity) < 0.01;

      // Apply rotation via CSS variable for performance
      if (windowRef.current) {
        windowRef.current.style.setProperty('--window-rotation', `${state.rotation}deg`);
      }

      if (!isSettled) {
        animationFrameId = requestAnimationFrame(updatePhysics);
      } else {
        // Ensure perfect 0 when stopped
        if (windowRef.current) {
           windowRef.current.style.setProperty('--window-rotation', `0deg`);
        }
        state.rotation = 0; // Reset exact state
      }
    };

    // Always start loop when drag status changes to ensure we wake up
    // Or just start it once and let it settle.
    animationFrameId = requestAnimationFrame((t) => {
      // Create a continuity in time
      if (physicsState.current.lastTime === 0) physicsState.current.lastTime = t;
      updatePhysics(t);
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging]); // Re-trigger on drag start/stop to ensure wake-up

  // Mouse/Touch move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // 1. Update Position (snap to 8px grid)
        const rawX = e.clientX - dragOffset.x;
        const rawY = e.clientY - dragOffset.y;

        // Get window dimensions for boundary checking
        const windowWidth = windowRef.current?.offsetWidth || 0;
        const windowHeight = windowRef.current?.offsetHeight || 0;
        const nextPosition = clampPosition(
          { x: rawX, y: rawY },
          { width: windowWidth, height: windowHeight }
        );

        setPosition(nextPosition);

        // 2. Update Physics Input
        // Calculate raw velocity
        const dx = e.clientX - physicsState.current.lastMouseX;

        // Update velocity (instantaneous impulse)
        physicsState.current.velocity = dx;
        physicsState.current.lastMouseX = e.clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];

        // 1. Update Position (snap to 8px grid)
        const rawX = touch.clientX - dragOffset.x;
        const rawY = touch.clientY - dragOffset.y;

        // Get window dimensions for boundary checking
        const windowWidth = windowRef.current?.offsetWidth || 0;
        const windowHeight = windowRef.current?.offsetHeight || 0;
        const nextPosition = clampPosition(
          { x: rawX, y: rawY },
          { width: windowWidth, height: windowHeight }
        );

        setPosition(nextPosition);

        // 2. Update Physics Input
        const dx = touch.clientX - physicsState.current.lastMouseX;
        physicsState.current.velocity = dx;
        physicsState.current.lastMouseX = touch.clientX;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (alignment || !windowRef.current) return;

    const clampToViewport = () => {
      if (!windowRef.current) return;
      const rect = windowRef.current.getBoundingClientRect();
      const nextPosition = clampPosition(
        positionRef.current,
        { width: rect.width, height: rect.height }
      );
      setPosition(nextPosition);
    };

    const resizeObserver = new ResizeObserver(() => {
      clampToViewport();
    });

    resizeObserver.observe(windowRef.current);
    window.addEventListener('resize', clampToViewport);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', clampToViewport);
    };
  }, [alignment]);

  const clampPosition = (
    rawPosition: { x: number; y: number },
    size: { width: number; height: number }
  ) => {
    const windowWidth = size.width;
    const windowHeight = size.height;

    const maxX = Math.max(0, window.innerWidth - windowWidth);
    const maxY = Math.max(0, window.innerHeight - windowHeight);
    const boundedX = Math.max(0, Math.min(maxX, rawPosition.x));
    const boundedY = Math.max(0, Math.min(maxY, rawPosition.y));

    return {
      x: Math.round(boundedX / 8) * 8,
      y: Math.round(boundedY / 8) * 8,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent drag if clicking close button
    if ((e.target as HTMLElement).closest('.close-box')) return;

    onFocus?.();
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });

      // Reset physics tracking for new drag
      physicsState.current.lastMouseX = e.clientX;
      // Keep existing velocity/rotation to preserve momentum if catching mid-air
      // But ensure loop is active (handled by setIsDragging -> useEffect)

      if (alignment) {
        // Snap to grid when switching from alignment to position
        setPosition({
          x: Math.round(rect.left / 8) * 8,
          y: Math.round(rect.top / 8) * 8
        });
        setAlignment(null);
      }

      setIsDragging(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Prevent drag if touching close button
    if ((e.target as HTMLElement).closest('.close-box')) return;

    onFocus?.();
    if (windowRef.current && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });

      // Reset physics tracking for new drag
      physicsState.current.lastMouseX = touch.clientX;

      if (alignment) {
        // Snap to grid when switching from alignment to position
        setPosition({
          x: Math.round(rect.left / 8) * 8,
          y: Math.round(rect.top / 8) * 8
        });
        setAlignment(null);
      }

      setIsDragging(true);
    }
  };

  useEffect(() => {
    if (!width || !height) return;
    setSize({ width, height });
  }, [width, height]);

  const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const current = windowRef.current;
    if (!current) return;
    resizeState.current = {
      x: e.clientX,
      y: e.clientY,
      width: current.offsetWidth,
      height: current.offsetHeight,
    };
    current.setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeState.current) return;
    const dx = e.clientX - resizeState.current.x;
    const dy = e.clientY - resizeState.current.y;
    setSize({
      width: Math.max(minWidth, resizeState.current.width + dx),
      height: Math.max(minHeight, resizeState.current.height + dy),
    });
  };

  const handleResizeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeState.current) return;
    resizeState.current = null;
    windowRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className="absolute flex resize flex-col overflow-hidden border border-black bg-[#fefdf9] font-['Chicago','Geneva','Charcoal','Helvetica',sans-serif] shadow-[2px_2px_0_rgba(0,0,0,0.55),_4px_4px_0_rgba(0,0,0,0.25)] box-border"
      style={{
        left: alignment === 'center' ? '50%' : (alignment === 'top-right' ? 'auto' : position.x),
        top: alignment === 'center' ? '50%' : (alignment === 'top-right' ? '20px' : position.y),
        right: alignment === 'top-right' ? '20px' : 'auto',
        zIndex: zIndex ?? 1000,
        minHeight,
        minWidth,
        height,
        width,
        ...(size ? { width: size.width, height: size.height } : null),
        // Combine the alignment transform with our dynamic rotation
        transform: `${alignment === 'center' ? 'translate(-50%, -50%)' : 'none'} rotate(var(--window-rotation, 0deg))`,
        willChange: isDragging ? 'transform' : 'auto'
      } as React.CSSProperties}
      ref={windowRef}
      data-window-id={windowId}
    >
      <div
        className="relative flex h-5 cursor-grab select-none items-center border-b border-black px-2 active:cursor-grabbing"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, #ffffff 0px, #ffffff 1px, #000000 1px, #000000 2px)',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="close-box relative z-[2] h-3 w-3 border border-black bg-white active:bg-black before:absolute before:inset-[1px] before:border before:border-black/70 before:content-['']"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
          <span className="inline-block bg-white px-2 text-[13px] font-bold leading-none tracking-[0.5px] shadow-[0_0_0_1px_rgba(0,0,0,0.25)]">
            {title}
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto bg-[#fdfcf6] p-4 text-[13px] leading-[1.45] text-black">
        {children}
      </div>
      <div
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
      >
        <div className="absolute bottom-[2px] right-[2px] h-3 w-3 opacity-40">
          <div className="absolute bottom-0 right-0 h-[2px] w-[10px] bg-black" />
          <div className="absolute bottom-0 right-0 h-[10px] w-[2px] bg-black" />
          <div className="absolute bottom-[4px] right-[4px] h-[2px] w-[6px] bg-black" />
          <div className="absolute bottom-[4px] right-[4px] h-[6px] w-[2px] bg-black" />
        </div>
      </div>
    </div>
  );
}
