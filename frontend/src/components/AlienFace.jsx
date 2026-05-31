import { useEffect, useState } from "react";

// 14 cols x 11 rows grid. Values:
// 0 = transparent, 1 = purple body, 2 = light purple (highlight/blush), 3 = white (eyes/mouth)

const W = 14;
const H = 11;

// Base alien silhouette (antennae + body + legs). Reused across expressions.
const base = [
  [0,0,0,0,1,0,0,0,0,1,0,0,0,0],
  [0,0,0,0,0,1,0,0,1,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1], // eyes row
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1], // mouth row
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,0,0,1,1,1,1,0,0,1,1,0],
  [1,1,0,0,0,0,0,0,0,0,0,0,1,1],
];

function cloneGrid(g) {
  return g.map((row) => [...row]);
}

const LE_C = 3; // left eye left col
const RE_C = 9; // right eye left col
const EYE_R = 4; // top row of eyes

function bigEye(g, row, col, v = 3) {
  g[row][col] = v; g[row][col + 1] = v;
  g[row + 1][col] = v; g[row + 1][col + 1] = v;
}

function blush(g) {
  g[6][1] = 2; g[6][2] = 2;
  g[6][11] = 2; g[6][12] = 2;
}

// ---------- Expressions ----------
function neutral() {
  const g = cloneGrid(base);
  bigEye(g, EYE_R, LE_C);
  bigEye(g, EYE_R, RE_C);
  g[7][6] = 3; g[7][7] = 3;
  return g;
}

function happy() {
  const g = cloneGrid(base);
  // crescent eyes ^ ^
  g[5][LE_C] = 3; g[5][LE_C + 1] = 3;
  g[4][LE_C - 1] = 3; g[4][LE_C + 2] = 3;
  g[5][RE_C] = 3; g[5][RE_C + 1] = 3;
  g[4][RE_C - 1] = 3; g[4][RE_C + 2] = 3;
  // wide smile
  g[7][4] = 3; g[7][5] = 3; g[7][6] = 3; g[7][7] = 3; g[7][8] = 3; g[7][9] = 3;
  g[6][3] = 3; g[6][10] = 3;
  blush(g);
  return g;
}

function shy() {
  const g = cloneGrid(base);
  g[5][LE_C + 1] = 3; g[5][RE_C] = 3;
  g[7][6] = 3; g[7][7] = 3;
  g[6][5] = 3; g[6][8] = 3;
  blush(g);
  g[5][0] = 2; g[5][13] = 2;
  return g;
}

function wink() {
  const g = cloneGrid(base);
  bigEye(g, EYE_R, LE_C);
  g[5][RE_C] = 3; g[5][RE_C + 1] = 3;
  g[4][RE_C + 2] = 3;
  g[7][6] = 3; g[7][7] = 3; g[7][8] = 3;
  g[6][9] = 3;
  return g;
}

function surprised() {
  const g = cloneGrid(base);
  bigEye(g, EYE_R, LE_C);
  bigEye(g, EYE_R, RE_C);
  g[7][6] = 3; g[7][7] = 3;
  g[8][6] = 3; g[8][7] = 3;
  return g;
}

function love() {
  const g = cloneGrid(base);
  // heart eyes
  g[4][LE_C] = 3; g[4][LE_C + 2] = 3;
  g[5][LE_C] = 3; g[5][LE_C + 1] = 3; g[5][LE_C + 2] = 3;
  g[6][LE_C + 1] = 3;
  g[4][RE_C] = 3; g[4][RE_C + 2] = 3;
  g[5][RE_C] = 3; g[5][RE_C + 1] = 3; g[5][RE_C + 2] = 3;
  g[6][RE_C + 1] = 3;
  g[7][6] = 3; g[7][7] = 3;
  g[6][5] = 3; g[6][8] = 3;
  blush(g);
  return g;
}

function sleepy() {
  const g = cloneGrid(base);
  g[5][LE_C - 1] = 3; g[5][LE_C] = 3; g[5][LE_C + 1] = 3; g[5][LE_C + 2] = 3;
  g[5][RE_C - 1] = 3; g[5][RE_C] = 3; g[5][RE_C + 1] = 3; g[5][RE_C + 2] = 3;
  g[7][6] = 3; g[7][7] = 3;
  return g;
}

function angry() {
  const g = cloneGrid(base);
  g[3][LE_C] = 3; g[3][LE_C + 1] = 3;
  g[4][LE_C + 2] = 3;
  g[3][RE_C + 1] = 3; g[3][RE_C + 2] = 3;
  g[4][RE_C] = 3;
  g[5][LE_C + 1] = 3; g[5][LE_C + 2] = 3;
  g[5][RE_C] = 3; g[5][RE_C + 1] = 3;
  g[8][5] = 3; g[8][6] = 3; g[8][7] = 3; g[8][8] = 3;
  g[7][4] = 3; g[7][9] = 3;
  return g;
}

const expressions = [
  { name: "happy", frames: [happy(), neutral(), happy(), neutral(), happy()] },
  { name: "shy", frames: [shy(), shy(), neutral(), shy()] },
  { name: "wink", frames: [neutral(), wink(), neutral(), wink()] },
  { name: "surprised", frames: [neutral(), surprised(), surprised()] },
  { name: "love", frames: [love(), neutral(), love()] },
  { name: "sleepy", frames: [neutral(), sleepy(), sleepy(), sleepy()] },
  { name: "angry", frames: [neutral(), angry(), angry(), neutral()] },
];

const FRAME_MS = 350;

export function PixelAlien({ pixelSize = 18 }) {
  const [grid, setGrid] = useState(() => neutral());
  const [label, setLabel] = useState("hello");
  const [bobUp, setBobUp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;

    const playOne = async () => {
      const exp = expressions[Math.floor(Math.random() * expressions.length)];
      setLabel(exp.name);
      for (let i = 0; i < exp.frames.length; i++) {
        if (cancelled) return;
        setGrid(exp.frames[i]);
        await new Promise((res) => { timer = setTimeout(res, FRAME_MS); });
      }
      if (cancelled) return;
      setGrid(neutral());
      await new Promise((res) => { timer = setTimeout(res, 400); });
      if (!cancelled) playOne();
    };

    playOne();
    const bobInterval = setInterval(() => setBobUp((b) => !b), 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(bobInterval);
    };
  }, []);

  const colorFor = (c) => {
    switch (c) {
      case 1: return "#6b21a8";       // purple body
      case 2: return "#c4b5fd";       // light purple blush
      case 3: return "#ffffff";       // eyes/mouth
      default: return "transparent";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div
        className="transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(${bobUp ? -6 : 0}px)` }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${W}, ${pixelSize}px)`,
            gridTemplateRows: `repeat(${H}, ${pixelSize}px)`,
            gap: Math.max(2, Math.round(pixelSize * 0.18)),
            imageRendering: "pixelated",
          }}
        >
          {grid.flatMap((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: colorFor(cell),
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PixelAlien;
