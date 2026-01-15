import { useEffect, useRef, useState } from 'react';

export default function VinylPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioSrc = '/audio/the-moon-got-tangled-in-the-branches-155041.mp3';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2.5 text-[#111111]">
      <div className="relative h-[210px] w-[260px] rounded-[10px] border-2 border-[#2c2c2c] bg-[linear-gradient(135deg,#c9c1b6,#f1e7d5)] shadow-[inset_0_0_0_2px_#ffffff]">
        <div
          className="absolute left-[26px] top-[20px] flex h-[170px] w-[170px] items-center justify-center rounded-full border-2 border-black bg-[repeating-radial-gradient(circle,#1a1a1a_0_2px,#242424_2px_4px),radial-gradient(circle_at_center,#141414_0_55%,#0b0b0b_56%_100%)] animate-[spin_18s_linear_infinite]"
          style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
        >
          <svg
            className="pointer-events-none absolute inset-0"
            viewBox="0 0 170 170"
            aria-hidden="true"
          >
            <defs>
              <path
                id="record-text-path"
                d="M 17,85 a 68,68 0 1,1 136,0"
              />
            </defs>
            <text
              fill="#e7e2d3"
              fontSize="7"
              letterSpacing="0.5"
              textAnchor="middle"
            >
              <textPath href="#record-text-path" startOffset="50%">
                MOON GOT TANGLED IN THE BRANCHES
              </textPath>
            </text>
          </svg>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#1b1b1b] bg-[radial-gradient(circle,#e8c97b_0_30%,#b07f36_60%_100%)] px-2 text-center text-[9px] font-semibold leading-[1.2] tracking-[0.6px] text-[#1b1408]" />
          <div className="absolute h-2.5 w-2.5 rounded-full bg-[#111111]" />
        </div>
        <button
          type="button"
          className="absolute right-[6px] top-[8px] h-[18px] w-[120px] origin-[106px_9px] cursor-pointer border-0 bg-transparent p-0 transition-transform duration-[350ms] ease focus:outline-none focus-visible:outline-none before:absolute before:left-[8px] before:top-[7px] before:h-1 before:w-[96px] before:rounded-full before:bg-[linear-gradient(90deg,#2b2b2b,#6a6a6a)] before:shadow-[inset_0_0_0_1px_#111111] before:content-[''] after:absolute after:left-0 after:top-[3px] after:h-3 after:w-4 after:rounded-full after:bg-[#2e2e2e] after:shadow-[inset_0_0_0_1px_#111111] after:content-['']"
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? 'Stop record' : 'Start record'}
          style={{ transform: isPlaying ? 'rotate(-38deg)' : 'rotate(-86deg)' }}
        >
          <span className="absolute left-1 top-[3px] h-3 w-[18px] rounded-[3px] bg-[#1b1b1b] shadow-[inset_0_0_0_1px_#000000]" />
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs font-bold tracking-[2px]">
        <span
          className="h-2.5 w-2.5 rounded-full border border-[#111111] bg-[#4b1b1b] shadow-[inset_0_0_0_1px_#2f0f0f] data-[playing=true]:bg-[#29c35d] data-[playing=true]:shadow-[0_0_6px_rgba(41,195,93,0.8)]"
          data-playing={isPlaying}
        />
        {isPlaying ? 'PLAY' : 'STOP'}
      </div>
      <audio ref={audioRef} src={audioSrc} loop preload="auto" aria-hidden="true" />
    </div>
  );
}
