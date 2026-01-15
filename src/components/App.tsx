import { useState } from 'react';
import GridBackground from './GridBackground';
import RetroWindow from './RetroWindow';
import VinylPlayer from './VinylPlayer';
import GoGame from './GoGame';

export default function App() {
  const [zOrder, setZOrder] = useState<Record<string, number>>({
    archived: 1001,
    vinyl: 1002,
    go: 1003,
    welcome: 1004
  });

  const bringToFront = (id: keyof typeof zOrder) => {
    setZOrder((prev) => {
      const maxZ = Math.max(...Object.values(prev));
      if (prev[id] === maxZ) return prev;
      return { ...prev, [id]: maxZ + 1 };
    });
  };

  const reportWindowPositions = () => {
    const windows = Array.from(document.querySelectorAll<HTMLElement>('[data-window-id]'));
    const positions = windows.map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        id: el.dataset.windowId || 'unknown',
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });
    console.table(positions);
    const message = positions
      .map((p) => `${p.id}: (${p.x}, ${p.y}) ${p.width}x${p.height}`)
      .join('\n');
    window.alert(message);
  };

  return (
    <>
      <GridBackground />
      <RetroWindow
        title="Archived V1"
        initialPosition={{ x: 488, y: 512 }}
        minHeight={360}
        minWidth={300}
        height={420}
        width={420}
        zIndex={zOrder.archived}
        onFocus={() => bringToFront('archived')}
        windowId="archived"
      >
        <iframe
          src="https://v1.sitixi.com"
          className="block h-full w-full border-0"
        />
      </RetroWindow>
      <RetroWindow
        title="Vinyl Player"
        initialPosition={{ x: 88, y: 360 }}
        height={290}
        width={300}
        zIndex={zOrder.vinyl}
        onFocus={() => bringToFront('vinyl')}
        windowId="vinyl"
      >
        <VinylPlayer />
      </RetroWindow>
      <RetroWindow
        title="Go (9x9)"
        initialPosition={{ x: 440, y: 80 }}
        height={375}
        width={300}
        zIndex={zOrder.go}
        onFocus={() => bringToFront('go')}
        windowId="go"
      >
        <GoGame />
      </RetroWindow>
      <RetroWindow
        title="Welcome"
        initialPosition={{ x: 32, y: 32 }}
        height={200}
        width={300}
        zIndex={zOrder.welcome}
        onFocus={() => bringToFront('welcome')}
        windowId="welcome"
      >
        <div className="space-y-2">
          <p>Hi, I'm Tianxin Shi.</p>
          <p>
            My usual handle is ST<span className="text-gray-600">one</span>X.
          </p>
          <p>I'm AI coding a few interesting projects.</p>
          <p className="flex flex-wrap items-center gap-2">
            <span>You can find me on</span>
            <span className="group relative inline-flex items-center">
              <span className="cursor-default text-black underline decoration-black/50 decoration-[1px] underline-offset-[3px] group-hover:decoration-black">
                WeChat
              </span>
              <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap border border-black bg-white px-2 py-0.5 text-[11px] shadow-[1px_1px_0_rgba(0,0,0,0.35)] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                ID: stonexer
              </span>
            </span>
            <span>and</span>
            <a
              href="https://x.com/TianxinShi"
              className="text-black underline decoration-black/50 decoration-[1px] underline-offset-[3px] hover:decoration-black"
            >
              X
            </a>
            <span>.</span>
          </p>
        </div>
      </RetroWindow>
      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={reportWindowPositions}
          className="fixed bottom-4 left-4 z-[2000] border border-black bg-white px-3 py-1 text-[12px] shadow-[2px_2px_0_rgba(0,0,0,0.45)]"
        >
          Report Window Positions
        </button>
      )}
    </>
  );
}
