import { useEffect, useRef, useCallback } from "react";

const GW = 460, GY = 62, DX = 40, DW = 44, DH = 48, G = 0.72, JV = -12, SPD0 = 3.2;

function makeCactus(variant) {
  if (variant === 0) return { w: 16, h: 34, path: `<rect x="5" y="0" width="6" height="34" rx="1" fill="currentColor"/><rect x="0" y="10" width="5" height="5" rx="1" fill="currentColor"/><rect x="0" y="6" width="4" height="10" rx="1" fill="currentColor"/><rect x="11" y="12" width="5" height="5" rx="1" fill="currentColor"/><rect x="12" y="8" width="4" height="10" rx="1" fill="currentColor"/>` };
  if (variant === 1) return { w: 28, h: 30, path: `<rect x="4" y="4" width="6" height="26" rx="1" fill="currentColor"/><rect x="0" y="12" width="4" height="4" rx="1" fill="currentColor"/><rect x="0" y="9" width="4" height="8" rx="1" fill="currentColor"/><rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor"/><rect x="10" y="8" width="4" height="8" rx="1" fill="currentColor"/><rect x="18" y="0" width="6" height="30" rx="1" fill="currentColor"/><rect x="24" y="8" width="4" height="4" rx="1" fill="currentColor"/><rect x="14" y="12" width="4" height="4" rx="1" fill="currentColor"/>` };
  return { w: 36, h: 32, path: `<rect x="4" y="6" width="5" height="26" rx="1" fill="currentColor"/><rect x="0" y="14" width="4" height="4" rx="1" fill="currentColor"/><rect x="9" y="12" width="4" height="4" rx="1" fill="currentColor"/><rect x="15" y="0" width="6" height="32" rx="1" fill="currentColor"/><rect x="10" y="10" width="5" height="4" rx="1" fill="currentColor"/><rect x="21" y="10" width="5" height="4" rx="1" fill="currentColor"/><rect x="27" y="6" width="5" height="26" rx="1" fill="currentColor"/><rect x="32" y="14" width="4" height="4" rx="1" fill="currentColor"/>` };
}

function makeBird(f) {
  const wing = f === 0
    ? `<ellipse cx="11" cy="4" rx="10" ry="5" fill="currentColor"/>`
    : `<ellipse cx="11" cy="14" rx="10" ry="5" fill="currentColor"/>`;
  return { w: 28, h: 18, path: `<ellipse cx="14" cy="11" rx="10" ry="5" fill="currentColor"/><circle cx="21" cy="7" r="5" fill="currentColor"/><polygon points="26,6 31,8.5 26,11" fill="currentColor"/><circle cx="23" cy="6" r="1.5" fill="white" opacity="0.85"/>${wing}` };
}

function chromeDinoSVG(frame, dead, duck) {
  if (duck) {
    return `<rect x="4" y="22" width="28" height="14" rx="1" fill="currentColor"/>
    <rect x="18" y="14" width="18" height="14" rx="1" fill="currentColor"/>
    <rect x="32" y="17" width="8" height="7" rx="1" fill="currentColor"/>
    <circle cx="30" cy="18" r="2.2" fill="currentColor"/>
    <circle cx="30" cy="18" r="1.1" fill="white" opacity="0.85"/>
    <rect x="1" y="26" width="7" height="6" rx="1" fill="currentColor"/>
    ${frame === 0
      ? `<rect x="10" y="32" width="7" height="12" rx="1" fill="currentColor"/><rect x="22" y="32" width="7" height="8" rx="1" fill="currentColor"/>`
      : `<rect x="10" y="32" width="7" height="8" rx="1" fill="currentColor"/><rect x="22" y="32" width="7" height="12" rx="1" fill="currentColor"/>`}`;
  }
  const eye = dead
    ? `<line x1="28" y1="7" x2="33" y2="12" stroke="white" stroke-width="1.5" opacity="0.85"/><line x1="33" y1="7" x2="28" y2="12" stroke="white" stroke-width="1.5" opacity="0.85"/>`
    : `<circle cx="31" cy="9" r="2.4" fill="currentColor"/><circle cx="31" cy="9" r="1.1" fill="white" opacity="0.9"/>`;
  const legs = dead
    ? `<rect x="14" y="36" width="7" height="10" rx="1" fill="currentColor"/><rect x="24" y="36" width="7" height="10" rx="1" fill="currentColor"/>`
    : frame === 0
      ? `<rect x="14" y="36" width="7" height="14" rx="1" fill="currentColor"/><rect x="14" y="48" width="10" height="4" rx="1" fill="currentColor"/><rect x="24" y="36" width="7" height="9" rx="1" fill="currentColor"/>`
      : `<rect x="14" y="36" width="7" height="9" rx="1" fill="currentColor"/><rect x="24" y="36" width="7" height="14" rx="1" fill="currentColor"/><rect x="22" y="48" width="10" height="4" rx="1" fill="currentColor"/>`;
  return `<rect x="10" y="14" width="26" height="22" rx="1" fill="currentColor"/>
  <rect x="20" y="4" width="20" height="18" rx="1" fill="currentColor"/>
  <rect x="36" y="10" width="8" height="6" rx="1" fill="currentColor"/>
  ${eye}
  <rect x="2" y="22" width="12" height="7" rx="1" fill="currentColor"/>
  <rect x="25" y="29" width="10" height="5" rx="1" fill="currentColor"/>
  ${legs}`;
}

export default function DinoRunner() {
  const svgRef = useRef(null);
  const stateRef = useRef({
    dinoY: GY - DH, velY: 0, jumping: false, ducking: false,
    fc: 0, leg: 0, score: 0, hi: 0, spd: SPD0,
    obs: [], clouds: [{ x: 60, y: 7, w: 40 }, { x: 200, y: 5, w: 30 }, { x: 360, y: 9, w: 46 }],
    state: "idle", nextObs: 110 + Math.floor(Math.random() * 70),
  });
  const rafRef = useRef(null);

  const doJump = useCallback(() => {
    const s = stateRef.current;
    if (s.state === "idle") { s.state = "running"; return; }
    if (s.state === "dead") {
      s.dinoY = GY - DH; s.velY = 0; s.jumping = false; s.ducking = false;
      s.obs = []; s.score = 0; s.spd = SPD0; s.fc = 0; s.leg = 0;
      s.nextObs = 110 + Math.floor(Math.random() * 70); s.state = "running";
      return;
    }
    if (!s.jumping && !s.ducking) { s.velY = JV; s.jumping = true; }
  }, []);

  const doDuck = useCallback((on) => {
    const s = stateRef.current;
    if (s.state !== "running") return;
    s.ducking = on;
    if (on && s.jumping) s.velY = Math.max(s.velY, 2);
  }, []);

  useEffect(() => {
    const wrap = svgRef.current?.parentElement;
    const handleKey = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); doJump(); }
      if (e.code === "ArrowDown") { e.preventDefault(); doDuck(true); }
    };
    const handleKeyUp = (e) => { if (e.code === "ArrowDown") doDuck(false); };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keydown", handleKey); window.removeEventListener("keyup", handleKeyUp); };
  }, [doJump, doDuck]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const dinoEl = svg.querySelector("#dg");
    const obsEl = svg.querySelector("#og");
    const cldEl = svg.querySelector("#cg");
    const gdEl = svg.querySelector("#gg");
    const scEl = svg.querySelector("#sc");
    const ovlEl = svg.querySelector("#ovl");

    const spawnObs = () => {
      const s = stateRef.current;
      const type = Math.random() > 0.35 ? "cactus" : "bird";
      if (type === "cactus") {
        const v = Math.floor(Math.random() * 3);
        const c = makeCactus(v);
        s.obs.push({ x: GW + 10, y: GY - c.h, w: c.w, h: c.h, type: "cactus", path: c.path });
      } else {
        const b = makeBird(0);
        const yOff = [0, 14, 26][Math.floor(Math.random() * 3)];
        s.obs.push({ x: GW + 10, y: GY - b.h - yOff, w: b.w, h: b.h, type: "bird", path: "" });
      }
    };

    const checkCollision = () => {
      const s = stateRef.current;
      const dinoBox = { x: DX + 6, y: s.dinoY + (s.ducking ? 10 : 4), w: DW - 10, h: s.ducking ? 24 : DH - 8 };
      for (const o of s.obs) {
        const ox = { x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 4 };
        if (dinoBox.x < ox.x + ox.w && dinoBox.x + dinoBox.w > ox.x && dinoBox.y < ox.y + ox.h && dinoBox.y + dinoBox.h > ox.y) return true;
      }
      return false;
    };

    const tick = () => {
      const s = stateRef.current;
      let showOverlay = s.state !== "running";
      let overlayText = s.state === "idle" ? "TAP / SPACE TO START" : "GAME OVER  —  TAP TO RESTART";

      if (s.state === "running") {
        s.fc++;
        if (!s.ducking && s.fc % 9 === 0) s.leg = 1 - s.leg;
        if (s.jumping) {
          s.velY += G; s.dinoY += s.velY;
          if (s.dinoY >= GY - DH) { s.dinoY = GY - DH; s.velY = 0; s.jumping = false; }
        }
        s.spd = SPD0 + s.score * 0.003;
        s.nextObs--;
        if (s.nextObs <= 0) { spawnObs(); s.nextObs = Math.floor((90 + Math.random() * 90) / Math.min(s.spd / SPD0, 1.8)); }
        s.obs = s.obs.map(o => ({ ...o, x: o.x - s.spd })).filter(o => o.x + o.w > -5);
        s.obs = s.obs.map(o => o.type === "bird" ? { ...o, path: makeBird(Math.floor(s.fc / 8) % 2).path } : o);
        s.clouds = s.clouds.map(c => c.x + c.w < 0 ? { x: GW + 10 + Math.random() * 40, y: 4 + Math.floor(Math.random() * 14), w: 28 + Math.floor(Math.random() * 22) } : { ...c, x: c.x - 0.3 });
        if (s.fc % 5 === 0) s.score++;
        if (checkCollision()) {
          s.state = "dead";
          if (s.score > s.hi) s.hi = s.score;
          showOverlay = true;
          overlayText = "GAME OVER  —  TAP TO RESTART";
        }
      }

      const duckY = s.ducking ? GY - 30 : s.dinoY;
      dinoEl.innerHTML = `<g transform="translate(${DX},${duckY})">${chromeDinoSVG(s.leg, s.state === "dead", s.ducking)}</g>`;
      obsEl.innerHTML = s.obs.map(o => `<g transform="translate(${o.x},${o.y})">${o.path}</g>`).join("");
      cldEl.innerHTML = s.clouds.map(c => `<g opacity="0.13"><ellipse cx="${c.x + c.w * .5}" cy="${c.y + 5}" rx="${c.w * .5}" ry="5" fill="currentColor"/><ellipse cx="${c.x + c.w * .3}" cy="${c.y + 3}" rx="${c.w * .28}" ry="4" fill="currentColor"/><ellipse cx="${c.x + c.w * .72}" cy="${c.y + 3}" rx="${c.w * .22}" ry="3.5" fill="currentColor"/></g>`).join("");
      let d = "";
      for (let i = 0; i < 24; i++) { const x = ((i * 22) + (s.score * 2.2)) % GW; d += `<rect x="${x}" y="65" width="9" height="1.5" rx="1" fill="currentColor" opacity="0.1"/>`; }
      gdEl.innerHTML = d;
      scEl.textContent = `HI ${String(s.hi).padStart(5, "0")}  ${String(s.score).padStart(5, "0")}`;
      ovlEl.style.display = showOverlay ? "" : "none";
      ovlEl.querySelector("text").textContent = overlayText;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      onClick={doJump}
      onTouchStart={(e) => { doJump(); e.preventDefault(); }}
      onTouchEnd={() => doDuck(false)}
      tabIndex={0}
      style={{ width: "100%", cursor: "pointer", userSelect: "none", outline: "none" }}
    >
      <svg ref={svgRef} viewBox="0 0 460 82" style={{ display: "block", width: "100%", color: "currentColor" }}>
        <defs><clipPath id="gc"><rect width="460" height="82" /></clipPath></defs>
        <g clipPath="url(#gc)">
          <g id="cg" />
          <line x1="0" y1="62" x2="460" y2="62" stroke="currentColor" strokeWidth="1.2" opacity="0.22" />
          <g id="gg" />
          <g id="og" />
          <g id="dg" />
          <text id="sc" x="452" y="12" textAnchor="end" fill="currentColor" opacity="0.3" fontSize="10" fontFamily="monospace" letterSpacing="2">HI 00000  00000</text>
          <g id="ovl">
            <text x="230" y="34" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="11" fontFamily="monospace">TAP / SPACE TO START</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
