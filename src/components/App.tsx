import GridBackground from './GridBackground';
import RetroWindow from './RetroWindow';
import VinylPlayer from './VinylPlayer';
import GoGame from './GoGame';

export default function App() {
  return (
    <>
      <GridBackground />
      <RetroWindow
        title="Archived V1"
        defaultAlignment="top-right"
        minHeight={360}
        height={360}
      >
        <iframe
          src="https://v1.sitixi.com"
          className="block h-full w-full border-0"
        />
      </RetroWindow>
      <RetroWindow title="Vinyl Player" initialPosition={{ x: 392, y: 520 }}>
        <VinylPlayer />
      </RetroWindow>
      <RetroWindow title="Go (9x9)" initialPosition={{ x: 392, y: 120 }}>
        <GoGame />
      </RetroWindow>
      <RetroWindow title="Welcome" initialPosition={{ x: 32, y: 96 }}>
        <div className="space-y-2">
          <p>Hi, I'm SToneX.</p>
          <p>My usual handle is SToneX.</p>
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
    </>
  );
}
