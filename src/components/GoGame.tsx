import { useMemo, useState } from 'react';

type Stone = 'B' | 'W' | null;
type Player = 'B' | 'W';

const BOARD_SIZE = 9;

const createBoard = (size: number): Stone[][] =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => null));

const opponentOf = (player: Player): Player => (player === 'B' ? 'W' : 'B');

const getNeighbors = (x: number, y: number, size: number) => {
  const neighbors: Array<[number, number]> = [];
  if (x > 0) neighbors.push([x - 1, y]);
  if (x < size - 1) neighbors.push([x + 1, y]);
  if (y > 0) neighbors.push([x, y - 1]);
  if (y < size - 1) neighbors.push([x, y + 1]);
  return neighbors;
};

const getGroup = (board: Stone[][], x: number, y: number) => {
  const size = board.length;
  const color = board[y][x];
  if (!color) return { stones: [] as Array<[number, number]>, liberties: 0 };

  const visited = new Set<string>();
  const stones: Array<[number, number]> = [];
  let liberties = 0;
  const stack: Array<[number, number]> = [[x, y]];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!;
    const key = `${cx},${cy}`;
    if (visited.has(key)) continue;
    visited.add(key);
    stones.push([cx, cy]);

    for (const [nx, ny] of getNeighbors(cx, cy, size)) {
      const neighbor = board[ny][nx];
      if (neighbor === null) {
        liberties += 1;
      } else if (neighbor === color && !visited.has(`${nx},${ny}`)) {
        stack.push([nx, ny]);
      }
    }
  }

  return { stones, liberties };
};

export default function GoGame() {
  const [board, setBoard] = useState<Stone[][]>(() => createBoard(BOARD_SIZE));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('B');
  const [captures, setCaptures] = useState({ B: 0, W: 0 });
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);

  const intersections = useMemo(
    () =>
      Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
        const x = index % BOARD_SIZE;
        const y = Math.floor(index / BOARD_SIZE);
        return { x, y };
      }),
    []
  );

  const handlePlace = (x: number, y: number) => {
    if (board[y][x]) return;

    const nextBoard = board.map((row) => row.slice());
    nextBoard[y][x] = currentPlayer;

    const opponent = opponentOf(currentPlayer);
    let capturedThisMove = 0;

    for (const [nx, ny] of getNeighbors(x, y, BOARD_SIZE)) {
      if (nextBoard[ny][nx] !== opponent) continue;
      const group = getGroup(nextBoard, nx, ny);
      if (group.liberties === 0) {
        for (const [gx, gy] of group.stones) {
          nextBoard[gy][gx] = null;
          capturedThisMove += 1;
        }
      }
    }

    const selfGroup = getGroup(nextBoard, x, y);
    if (selfGroup.liberties === 0 && capturedThisMove === 0) {
      return;
    }

    setBoard(nextBoard);
    setLastMove([x, y]);
    if (capturedThisMove > 0) {
      setCaptures((prev) => ({
        ...prev,
        [currentPlayer]: prev[currentPlayer] + capturedThisMove,
      }));
    }
    setCurrentPlayer(opponent);
  };

  const handleReset = () => {
    setBoard(createBoard(BOARD_SIZE));
    setCurrentPlayer('B');
    setCaptures({ B: 0, W: 0 });
    setLastMove(null);
  };

  const handlePass = () => {
    setCurrentPlayer(opponentOf(currentPlayer));
  };

  const spacing = 28;
  const boardPadding = 16;
  const boardLength = (BOARD_SIZE - 1) * spacing;
  const lineLength = boardLength + 1;

  return (
    <div className="flex flex-col gap-3 text-[13px]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-black shadow-[inset_0_0_0_1px_#000000]" />
            Black {currentPlayer === 'B' ? '•' : ''}
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-white shadow-[inset_0_0_0_1px_#000000]" />
            White {currentPlayer === 'W' ? '•' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePass}
            className="border border-black bg-white px-2 py-0.5 text-[12px] shadow-[1px_1px_0_rgba(0,0,0,0.35)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            Pass
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="border border-black bg-white px-2 py-0.5 text-[12px] shadow-[1px_1px_0_rgba(0,0,0,0.35)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[12px]">
        <span>Captures</span>
        <span>Black {captures.B}</span>
        <span>White {captures.W}</span>
      </div>
      <div
        className="relative w-fit rounded-[6px] border-2 border-[#2c1f12] bg-[#d7b489] shadow-[inset_0_0_0_2px_#f3dfbd,2px_2px_0_rgba(0,0,0,0.4)]"
        style={{
          padding: `${boardPadding}px`,
          width: `${boardPadding * 2 + boardLength}px`,
          height: `${boardPadding * 2 + boardLength}px`,
        }}
      >
        <div
          className="pointer-events-none absolute"
          style={{
            left: boardPadding,
            top: boardPadding,
            width: lineLength,
            height: lineLength,
            backgroundImage:
              'linear-gradient(to right, #2c1f12 1px, transparent 1px), linear-gradient(to bottom, #2c1f12 1px, transparent 1px)',
            backgroundSize: `${spacing}px ${spacing}px`,
          }}
        />
        {intersections.map(({ x, y }) => {
          const stone = board[y][x];
          const isLast = lastMove?.[0] === x && lastMove?.[1] === y;
          return (
            <button
              key={`${x},${y}`}
              type="button"
              onClick={() => handlePlace(x, y)}
              className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 bg-transparent p-0"
              style={{
                left: boardPadding + x * spacing,
                top: boardPadding + y * spacing,
              }}
              aria-label={`Place at ${x + 1}, ${y + 1}`}
            >
              {stone && (
                <span
                  className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[inset_0_0_0_1px_#000000,0_1px_1px_rgba(0,0,0,0.4)] ${
                    stone === 'B' ? 'bg-black' : 'bg-white'
                  }`}
                />
              )}
              {isLast && (
                <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d13c2f] shadow-[0_0_0_1px_rgba(0,0,0,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
