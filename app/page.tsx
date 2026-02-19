"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AgeData {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  nextBirthday: number;
  zodiac: string;
  zodiacEmoji: string;
  birthDay: string;
  h: string;
  m: string;
  s: string;
}

// ─── Zodiac ───────────────────────────────────────────────────────────────────
function getZodiac(mo: number, d: number) {
  const signs = [
    { s: "Capricorn", e: "♑", m: 1, d: 19 },
    { s: "Aquarius", e: "♒", m: 2, d: 18 },
    { s: "Pisces", e: "♓", m: 3, d: 20 },
    { s: "Aries", e: "♈", m: 4, d: 19 },
    { s: "Taurus", e: "♉", m: 5, d: 20 },
    { s: "Gemini", e: "♊", m: 6, d: 20 },
    { s: "Cancer", e: "♋", m: 7, d: 22 },
    { s: "Leo", e: "♌", m: 8, d: 22 },
    { s: "Virgo", e: "♍", m: 9, d: 22 },
    { s: "Libra", e: "♎", m: 10, d: 22 },
    { s: "Scorpio", e: "♏", m: 11, d: 21 },
    { s: "Sagittarius", e: "♐", m: 12, d: 21 },
    { s: "Capricorn", e: "♑", m: 12, d: 31 },
  ];
  for (const z of signs) if (mo < z.m || (mo === z.m && d <= z.d)) return z;
  return signs[0];
}

// ─── Compute age ──────────────────────────────────────────────────────────────
function computeAge(dob: string): AgeData | null {
  const birth = new Date(dob);
  const now = new Date();
  if (birth >= now) return null;

  let yr = now.getFullYear() - birth.getFullYear();
  let mo = now.getMonth() - birth.getMonth();
  let dy = now.getDate() - birth.getDate();
  if (dy < 0) {
    mo--;
    dy += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (mo < 0) {
    yr--;
    mo += 12;
  }

  const diff = now.getTime() - birth.getTime();
  const totalDays = Math.floor(diff / 86400000);
  const totalHours = Math.floor(diff / 3600000);

  const nextBd = new Date(birth);
  nextBd.setFullYear(now.getFullYear());
  if (nextBd <= now) nextBd.setFullYear(now.getFullYear() + 1);
  const daysUntilBd = Math.ceil((nextBd.getTime() - now.getTime()) / 86400000);

  const z = getZodiac(birth.getMonth() + 1, birth.getDate());
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const p = (n: number) => String(n).padStart(2, "0");

  return {
    years: yr,
    months: mo,
    days: dy,
    totalDays,
    totalHours,
    nextBirthday: daysUntilBd,
    zodiac: z.s,
    zodiacEmoji: z.e,
    birthDay: dayNames[birth.getDay()],
    h: p(now.getHours()),
    m: p(now.getMinutes()),
    s: p(now.getSeconds()),
  };
}

// ─── Analog Clock ─────────────────────────────────────────────────────────────
function AnalogClock({ size = 200 }: { size?: number }) {
  const hrRef = useRef<SVGLineElement>(null);
  const mnRef = useRef<SVGLineElement>(null);
  const scRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    function tick() {
      const now = new Date();
      const s = now.getSeconds();
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;
      const pt = (r: number, deg: number) => {
        const a = ((deg - 90) * Math.PI) / 180;
        return { x: 100 + r * Math.cos(a), y: 100 + r * Math.sin(a) };
      };
      const setLine = (
        ref: React.RefObject<SVGLineElement | null>,
        r: number,
        deg: number,
      ) => {
        if (!ref.current) return;
        const p = pt(r, deg);
        ref.current.setAttribute("x2", p.x.toFixed(2));
        ref.current.setAttribute("y2", p.y.toFixed(2));
      };
      setLine(hrRef, 48, h * 30);
      setLine(mnRef, 66, m * 6);
      setLine(scRef, 74, s * 6);
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const id = `c${size}`;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <radialGradient id={`rg${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#028090" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#05668D" stopOpacity="0.05" />
        </radialGradient>
        <filter id={`gf${id}`}>
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="100"
        cy="100"
        r="95"
        fill={`url(#rg${id})`}
        stroke="#00A896"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={100 + 78 * Math.cos(a)}
            y1={100 + 78 * Math.sin(a)}
            x2={100 + 88 * Math.cos(a)}
            y2={100 + 88 * Math.sin(a)}
            stroke="#02C39A"
            strokeWidth="2"
            strokeOpacity="0.6"
          />
        );
      })}
      {Array.from({ length: 60 }, (_, i) => {
        if (i % 5 === 0) return null;
        const a = ((i * 6 - 90) * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={100 + 83 * Math.cos(a)}
            y1={100 + 83 * Math.sin(a)}
            x2={100 + 88 * Math.cos(a)}
            y2={100 + 88 * Math.sin(a)}
            stroke="#00A896"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />
        );
      })}
      <line
        ref={hrRef}
        x1="100"
        y1="100"
        x2="100"
        y2="52"
        stroke="#F0F3BD"
        strokeWidth="4"
        strokeLinecap="round"
        filter={`url(#gf${id})`}
      />
      <line
        ref={mnRef}
        x1="100"
        y1="100"
        x2="100"
        y2="34"
        stroke="#02C39A"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter={`url(#gf${id})`}
      />
      <line
        ref={scRef}
        x1="100"
        y1="100"
        x2="100"
        y2="26"
        stroke="#F0F3BD"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="100" cy="100" r="5" fill="#02C39A" filter={`url(#gf${id})`} />
      <circle cx="100" cy="100" r="2" fill="#F0F3BD" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [data, setData] = useState<AgeData | null>(null);
  const [shown, setShown] = useState(false);
  const [animKey, setAnimKey] = useState(0); // bump to retrigger entrance
  const [nowTime, setNowTime] = useState(new Date());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live clock display
  useEffect(() => {
    const t = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Live age ticker — only updates data state, no remount
  const startTicker = useCallback((dobVal: string) => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setData(computeAge(dobVal));
    }, 1000);
  }, []);

  const calculate = () => {
    if (!dob) return;
    const result = computeAge(dob);
    if (!result) return;
    setData(result);
    setShown(true);
    setAnimKey((k) => k + 1); // new key = re-mount result shell = animations retrigger ONCE
    startTicker(dob);
  };

  useEffect(
    () => () => {
      if (tickRef.current) clearInterval(tickRef.current);
    },
    [],
  );

  const today = new Date().toISOString().split("T")[0];
  const p = (n: string | number) => String(n).padStart(2, "0");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:ital,wght@0,300;0,600;1,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --c1:#05668D;--c2:#028090;--c3:#00A896;--c4:#02C39A;--c5:#F0F3BD;
          --dark:#021A20;--card-bg:rgba(2,128,144,0.08);--border:rgba(2,195,154,0.25);
        }
        body { font-family:'Exo 2',sans-serif; background:var(--dark); color:var(--c5); }

        .bg-layer { position:fixed;inset:0;z-index:0;
          background:radial-gradient(ellipse at 20% 50%,rgba(5,102,141,.35) 0%,transparent 60%),
                     radial-gradient(ellipse at 80% 20%,rgba(0,168,150,.2) 0%,transparent 50%),
                     radial-gradient(ellipse at 60% 80%,rgba(2,195,154,.15) 0%,transparent 45%),#021A20; }
        .bg-clock-wrap { position:fixed;width:min(60vw,600px);height:min(60vw,600px);
          top:50%;left:50%;transform:translate(-50%,-50%);opacity:.06;z-index:0;
          animation:slowSpin 120s linear infinite; }
        @keyframes slowSpin { to { transform:translate(-50%,-50%) rotate(360deg); } }
        .grid { position:fixed;inset:0;z-index:0;
          background-image:linear-gradient(rgba(2,195,154,.04) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(2,195,154,.04) 1px,transparent 1px);
          background-size:60px 60px; }

        /* Sidebar */
        .sidebar { position:fixed;right:0;top:0;bottom:0;width:260px;
          background:rgba(5,102,141,.12);backdrop-filter:blur(20px);
          border-left:1px solid var(--border);z-index:10;
          display:flex;flex-direction:column;padding:1.5rem 1.25rem;gap:1.25rem;overflow-y:auto; }
        .sb-title { font-family:'Orbitron',monospace;font-size:.6rem;letter-spacing:.25em;
          text-transform:uppercase;color:var(--c4);border-bottom:1px solid var(--border);padding-bottom:.6rem; }
        .sb-clock { width:140px;height:140px;margin:0 auto;filter:drop-shadow(0 0 20px rgba(2,195,154,.4)); }
        .sb-time { font-family:'Orbitron',monospace;font-size:1.3rem;color:var(--c5);letter-spacing:.1em;text-align:center; }
        .sb-date { font-size:.7rem;color:var(--c3);margin-top:.25rem;font-style:italic;text-align:center; }
        .sb-zodiac { text-align:center;font-size:2.5rem;animation:zbounce .6s ease-in-out 2 both; }
        @keyframes zbounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
        .sb-preview { background:rgba(0,168,150,.08);border:1px solid var(--border);border-radius:12px;padding:.875rem; }
        .sb-preview-label { font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;color:var(--c3);margin-bottom:.5rem; }
        .sb-row { display:flex;justify-content:space-between;align-items:center;
          padding:.35rem 0;border-bottom:1px solid rgba(2,195,154,.1);font-size:.75rem; }
        .sb-row:last-child { border-bottom:none; }
        .sb-val { font-family:'Orbitron',monospace;font-size:.85rem;color:var(--c4); }
        .sb-empty { color:var(--c2);font-size:.7rem;text-align:center;line-height:1.6; }

        /* Main */
        .main { flex:1;margin-right:260px;position:relative;z-index:1;
          display:flex;flex-direction:column;align-items:center;
          padding:3rem 1.5rem 4rem;min-height:100vh; }

        /* Header - plays once */
        .header { text-align:center;margin-bottom:2.5rem;animation:fadeDown .8s ease both; }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-30px)} to{opacity:1;transform:none} }
        .eyebrow { font-family:'Orbitron',monospace;font-size:.6rem;letter-spacing:.4em;
          text-transform:uppercase;color:var(--c4);margin-bottom:.6rem; }
        .title { font-family:'Orbitron',monospace;font-size:clamp(1.8rem,5vw,3rem);font-weight:900;
          background:linear-gradient(135deg,var(--c5) 0%,var(--c4) 50%,var(--c3) 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          filter:drop-shadow(0 0 40px rgba(2,195,154,.5)); }
        .badge { display:inline-flex;align-items:center;gap:.4rem;margin-top:.4rem;
          font-size:.65rem;letter-spacing:.15em;color:var(--c3);font-style:italic;opacity:.8; }

        /* Input card - plays once */
        .icard { width:100%;max-width:480px;background:var(--card-bg);backdrop-filter:blur(16px);
          border:1px solid var(--border);border-radius:20px;padding:2rem;
          position:relative;overflow:hidden;animation:fadeUp .8s ease .2s both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
        .icard::before { content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(2,195,154,.05) 0%,transparent 60%);pointer-events:none; }
        .ilabel { display:block;font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;
          color:var(--c4);margin-bottom:.5rem; }
        .idate { width:100%;background:rgba(5,102,141,.2);border:1px solid var(--border);
          border-radius:10px;padding:.875rem 1.1rem;color:var(--c5);
          font-family:'Orbitron',monospace;font-size:.9rem;outline:none;
          transition:border-color .3s,box-shadow .3s;cursor:pointer; }
        .idate:focus { border-color:var(--c4);box-shadow:0 0 0 3px rgba(2,195,154,.15); }
        .idate::-webkit-calendar-picker-indicator { filter:invert(1) sepia(1) saturate(3) hue-rotate(120deg); }
        .btn { width:100%;margin-top:1.25rem;padding:.875rem;
          background:linear-gradient(135deg,var(--c3),var(--c4));border:none;border-radius:10px;
          color:#021A20;font-family:'Orbitron',monospace;font-size:.8rem;font-weight:700;
          letter-spacing:.15em;text-transform:uppercase;cursor:pointer;
          transition:transform .2s,box-shadow .2s; }
        .btn:hover { transform:translateY(-2px);box-shadow:0 10px 40px rgba(2,195,154,.4); }
        .btn:active { transform:translateY(0); }

        /* Results — KEY TRICK: animKey on the wrapper forces React to remount it,
           so all child CSS animations replay exactly ONCE per calculate() press. */
        .res-wrap { width:100%;max-width:480px;margin-top:1.75rem;
          animation:fadeUp .55s cubic-bezier(.22,1,.36,1) both; }

        /* Hero — sweep plays once, no infinite */
        .hero { text-align:center;margin-bottom:1.5rem;padding:1.75rem;
          background:linear-gradient(135deg,rgba(5,102,141,.2),rgba(2,195,154,.1));
          border:1px solid rgba(2,195,154,.3);border-radius:16px;
          position:relative;overflow:hidden; }
        .hero::before { content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;
          background:conic-gradient(from 0deg,transparent,rgba(2,195,154,.06),transparent);
          animation:sweep 1.2s ease-out 1 forwards; }
        @keyframes sweep { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .age-num { font-family:'Orbitron',monospace;font-size:clamp(3.5rem,10vw,6rem);font-weight:900;
          background:linear-gradient(135deg,var(--c4) 0%,var(--c5) 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          line-height:1;filter:drop-shadow(0 0 30px rgba(2,195,154,.6));position:relative;z-index:1; }
        .age-lbl { font-size:.75rem;letter-spacing:.3em;text-transform:uppercase;
          color:var(--c3);margin-top:.5rem;position:relative;z-index:1; }
        .age-det { font-family:'Orbitron',monospace;font-size:.85rem;color:var(--c5);
          margin-top:.6rem;position:relative;z-index:1; }
        .ticker { margin-top:.6rem;display:flex;align-items:center;gap:.5rem;
          justify-content:center;font-size:.65rem;color:var(--c3);position:relative;z-index:1; }
        .dot { width:6px;height:6px;border-radius:50%;background:var(--c4);
          animation:blink 1.4s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.15} }

        /* Stat cards — pop once (fill-mode:both keeps final state) */
        .sgrid { display:grid;grid-template-columns:repeat(2,1fr);gap:.65rem; }
        .scard { background:var(--card-bg);border:1px solid var(--border);border-radius:12px;
          padding:.875rem;text-align:center;
          animation:popIn .5s cubic-bezier(.34,1.56,.64,1) both;
          transition:transform .2s,box-shadow .2s; }
        .scard:hover { transform:translateY(-3px);box-shadow:0 8px 30px rgba(2,195,154,.2);border-color:var(--c4); }
        @keyframes popIn { from{opacity:0;transform:scale(.78)} to{opacity:1;transform:scale(1)} }
        .sv { font-family:'Orbitron',monospace;font-size:1.3rem;font-weight:700;
          color:var(--c4);filter:drop-shadow(0 0 10px rgba(2,195,154,.4)); }
        .sl { font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:var(--c3);margin-top:.2rem; }

        .irow { display:flex;justify-content:space-between;align-items:center;
          padding:.65rem .875rem;background:var(--card-bg);border:1px solid var(--border);
          border-radius:10px;margin-top:.65rem;font-size:.8rem; }
        .irow-l { color:var(--c3); }
        .irow-v { font-family:'Orbitron',monospace;font-size:.85rem;color:var(--c5); }

        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:var(--c2);border-radius:2px; }
        @media(max-width:768px) { .sidebar{display:none} .main{margin-right:0;padding:2rem 1rem} }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div className="bg-layer" />
        <div className="grid" />
        <div className="bg-clock-wrap">
          <AnalogClock size={600} />
        </div>

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sb-title">⬡ Live Preview</div>
          <div className="sb-clock">
            <AnalogClock size={140} />
          </div>
          <div>
            <div className="sb-time">
              {p(nowTime.getHours())}:{p(nowTime.getMinutes())}:
              {p(nowTime.getSeconds())}
            </div>
            <div className="sb-date">
              {nowTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>

          {data ? (
            <>
              {/* key on animKey so zodiac emoji replays 2 bounces on each new calc */}
              <div className="sb-zodiac" key={animKey}>
                {data.zodiacEmoji}
              </div>
              <div className="sb-preview">
                <div className="sb-preview-label">Quick Stats</div>
                <div className="sb-row">
                  <span>Age</span>
                  <span className="sb-val">{data.years} yrs</span>
                </div>
                <div className="sb-row">
                  <span>Total Days</span>
                  <span className="sb-val">
                    {data.totalDays.toLocaleString()}
                  </span>
                </div>
                <div className="sb-row">
                  <span>Next Birthday</span>
                  <span className="sb-val">{data.nextBirthday}d</span>
                </div>
                <div className="sb-row">
                  <span>Zodiac</span>
                  <span className="sb-val">{data.zodiac}</span>
                </div>
                <div className="sb-row">
                  <span>Born On</span>
                  <span className="sb-val">{data.birthDay.slice(0, 3)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="sb-empty">
              Enter your date of birth to see your stats here
            </div>
          )}
        </aside>

        {/* ── Main ── */}
        <main className="main">
          <header className="header">
            <div className="eyebrow">⟡ Temporal Intelligence ⟡</div>
            <h1 className="title">AGE CALCULATOR</h1>
            <div className="badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13.976 1.5L3 14.5h8.5L10.024 22.5L21 9.5h-8.5L13.976 1.5z"
                  fill="#02C39A"
                />
              </svg>
              Backed by Supabase
            </div>
          </header>

          <div className="icard">
            <label className="ilabel" htmlFor="dob">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              className="idate"
              max={today}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <button className="btn" onClick={calculate}>
              ⬡ &nbsp; Calculate Age &nbsp; ⬡
            </button>
          </div>

          {/* Results: key=animKey causes remount → all child CSS animations replay once */}
          {shown && data && (
            <div className="res-wrap" key={animKey}>
              <div className="hero">
                <div className="age-num">{data.years}</div>
                <div className="age-lbl">Years Old</div>
                <div className="age-det">
                  {data.months} months · {data.days} days · {data.h}h {data.m}m{" "}
                  {data.s}s
                </div>
                <div className="ticker">
                  <span className="dot" /> LIVE COUNTING
                </div>
              </div>

              <div className="sgrid">
                {[
                  { v: data.totalDays.toLocaleString(), l: "Total Days", d: 0 },
                  {
                    v: data.totalHours.toLocaleString(),
                    l: "Total Hours",
                    d: 80,
                  },
                  { v: data.nextBirthday, l: "Days to Birthday", d: 160 },
                  { v: data.birthDay.slice(0, 3), l: "Birth Weekday", d: 240 },
                ].map(({ v, l, d }) => (
                  <div
                    className="scard"
                    key={l}
                    style={{ animationDelay: `${d}ms` }}
                  >
                    <div className="sv">{v}</div>
                    <div className="sl">{l}</div>
                  </div>
                ))}
              </div>

              <div className="irow">
                <span className="irow-l">Zodiac Sign</span>
                <span className="irow-v">
                  {data.zodiacEmoji} {data.zodiac}
                </span>
              </div>
              <div className="irow">
                <span className="irow-l">Heartbeats (est.)</span>
                <span className="irow-v">
                  ~{(data.totalDays * 100000).toLocaleString()}
                </span>
              </div>
              <div className="irow">
                <span className="irow-l">Breaths Taken (est.)</span>
                <span className="irow-v">
                  ~{(data.totalDays * 20000).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
