import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  C,
  Card,
  Emoji,
  PanelTitle,
  pop,
  SidePanel,
  useActiveLine,
  useReveal,
  VisualProps,
} from "../ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const BallotBox: React.FC<{ t: number; size: number }> = ({ t, size }) => {
  // t: frames since animation start
  const cycle = t % 60;
  const drop = interpolate(cycle, [0, 30], [-90, 40], clamp);
  const paperOpacity = interpolate(cycle, [0, 6, 28, 34], [0, 1, 1, 0], clamp);
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <defs>
        <linearGradient id="bx" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9d4f5" />
        </linearGradient>
      </defs>
      <g opacity={paperOpacity} transform={`translate(0 ${drop})`}>
        <rect x="72" y="30" width="56" height="70" rx="6" fill="#fff" stroke="#999" strokeWidth="2" />
        <path d="M84 62 l10 10 l20 -22" stroke={C.pink} strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>
      <rect x="30" y="90" width="140" height="100" rx="12" fill="url(#bx)" />
      <polygon points="30,90 170,90 150,70 50,70" fill="#efeafc" />
      <rect x="70" y="76" width="60" height="7" rx="3" fill="#3a2a6a" />
      <rect x="55" y="120" width="90" height="40" rx="8" fill={C.pink} />
      <text x="100" y="149" textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff" fontFamily="PromptTH">
        VOTE
      </text>
    </svg>
  );
};

export const ParticipationVisual: React.FC<VisualProps> = ({ lines }) => {
  const frame = useCurrentFrame();
  const active = useActiveLine(lines);
  const def = useReveal(lines, 1);
  const vote = useReveal(lines, 2);
  const forms = useReveal(lines, 3);
  const online = useReveal(lines, 4);
  const showGrid = interpolate(frame, [lines[3].start - 10, lines[3].start + 5], [0, 1], clamp);
  const items = [
    { e: "📢", t: "รณรงค์หาเสียง" },
    { e: "🏢", t: "ติดต่อเจ้าหน้าที่รัฐ" },
    { e: "✍️", t: "เข้าชื่อเสนอกฎหมาย" },
    { e: "🕊️", t: "ชุมนุมโดยสงบ" },
  ];
  const onlineItems = [
    { e: "💻", t: "ลงชื่อแคมเปญออนไลน์" },
    { e: "💬", t: "แสดงความเห็นสร้างสรรค์" },
  ];
  return (
    <SidePanel>
      <PanelTitle title="การมีส่วนร่วมทางการเมือง" tag="ส่วนที่ 2 · Political Participation" color={C.gold} />
      <Card glow={C.gold} active={def * 0.5} style={{ padding: "20px 28px", ...pop(def) }}>
        <div style={{ fontSize: 30, lineHeight: 1.55 }}>
          <Emoji e="📖" size={34} /> กิจกรรมที่ประชาชนทำ <b style={{ color: C.gold }}>โดยสมัครใจ</b>{" "}
          เพื่อมีอิทธิพลต่อการตัดสินใจของรัฐ หรือการเลือกผู้ปกครอง
        </div>
      </Card>
      <div style={{ position: "relative", flex: 1, marginTop: 22 }}>
        {/* Voting highlight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            gap: 30,
            opacity: vote * (1 - showGrid),
            transform: `scale(${0.9 + vote * 0.1})`,
          }}
        >
          <BallotBox t={frame - lines[2].start} size={330} />
          <div>
            <div style={{ fontSize: 54, fontWeight: 800, color: C.pinkSoft }}>การเลือกตั้ง</div>
            <div style={{ fontSize: 32, color: C.muted, marginTop: 6 }}>รูปแบบที่พบบ่อยที่สุด</div>
            <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
              {["สิทธิ", "หน้าที่"].map((t, i) => (
                <div
                  key={t}
                  style={{
                    padding: "10px 26px",
                    borderRadius: 999,
                    fontSize: 32,
                    fontWeight: 800,
                    background: i ? C.gold : C.pink,
                    color: i ? "#2a1a00" : "#fff",
                    ...pop(Math.max(0, Math.min(1, vote * 1.5 - i * 0.3))),
                  }}
                >
                  {t}ของพลเมือง
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Other forms */}
        <div style={{ position: "absolute", inset: 0, opacity: showGrid }}>
          <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
            <div
              style={{
                width: 190,
                borderRadius: 24,
                background: "rgba(255,79,163,0.18)",
                border: `2px solid ${C.pink}`,
                textAlign: "center",
                padding: "14px 6px",
              }}
            >
              <Emoji e="🗳️" size={64} />
              <div style={{ fontSize: 28, fontWeight: 800 }}>เลือกตั้ง</div>
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {items.map((it, i) => {
                const p = Math.max(0, Math.min(1, forms * 1.8 - i * 0.28));
                return (
                  <Card
                    key={it.t}
                    glow={C.gold}
                    active={active === 3 ? p * 0.5 : 0}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", fontSize: 28, ...pop(p, 20) }}
                  >
                    <Emoji e={it.e} size={46} /> {it.t}
                  </Card>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 22, ...pop(online, 20) }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: C.teal, marginBottom: 10 }}>
              <Emoji e="🌐" size={32} /> ยุคดิจิทัล: การมีส่วนร่วมออนไลน์
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {onlineItems.map((it, i) => (
                <div
                  key={it.t}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    fontSize: 28,
                    padding: "14px 18px",
                    borderRadius: 20,
                    background: "rgba(61,214,198,0.14)",
                    border: `2px solid ${C.teal}`,
                    ...pop(Math.max(0, Math.min(1, online * 1.6 - i * 0.3)), 20),
                  }}
                >
                  <Emoji e={it.e} size={44} /> {it.t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidePanel>
  );
};

const ThreeSectors: React.FC<{ p: number; focus: number }> = ({ p, focus }) => {
  const circles = [
    { x: 120, y: 120, t: "ภาครัฐ", e: "🏛️", c: C.sky, f: 0 },
    { x: 360, y: 120, t: "ภาคธุรกิจ", e: "🏪", c: C.gold, f: 0 },
    { x: 240, y: 300, t: "ประชาสังคม", e: "🤝", c: C.teal, f: 1 },
  ];
  return (
    <svg width={480} height={430} viewBox="0 0 480 430">
      {circles.map((ci, i) => {
        const s = Math.max(0, Math.min(1, p * 1.6 - i * 0.25));
        const hi = ci.f * focus;
        return (
          <g key={ci.t} transform={`translate(${ci.x} ${ci.y}) scale(${s * (1 + hi * 0.08)})`}>
            <circle r={108} fill={ci.c} fillOpacity={0.18 + hi * 0.25} stroke={ci.c} strokeWidth={4 + hi * 3} />
            <text textAnchor="middle" y={-6} fontSize={52} fontFamily='"Noto Color Emoji"'>
              {ci.e}
            </text>
            <text textAnchor="middle" y={44} fontSize={30} fontWeight={800} fill="#fff" fontFamily="PromptTH">
              {ci.t}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Pillars: React.FC<{ p: number }> = ({ p }) => {
  const labels = ["ตรวจสอบ", "สะท้อนเสียง", "แก้ปัญหา"];
  return (
    <svg width={460} height={400} viewBox="0 0 460 400">
      <polygon
        points="30,110 230,20 430,110"
        fill={C.gold}
        transform={`translate(0 ${(1 - p) * -60})`}
        opacity={p}
      />
      <rect x={40} y={110} width={380} height={24} fill="#ffe4a3" opacity={p} transform={`translate(0 ${(1 - p) * -60})`} />
      <text x={230} y={92} textAnchor="middle" fontSize={30} fontWeight={800} fill="#3a2600" fontFamily="PromptTH" opacity={p}>
        ประชาธิปไตย
      </text>
      {labels.map((l, i) => {
        const h = 200 * Math.max(0, Math.min(1, p * 1.5 - i * 0.2));
        const x = 70 + i * 120;
        return (
          <g key={l}>
            <rect x={x} y={340 - h} width={80} height={h} rx={8} fill={C.teal} />
            <text
              x={x + 40}
              y={240}
              textAnchor="middle"
              fontSize={24}
              fontWeight={800}
              fill="#06332e"
              fontFamily="PromptTH"
              transform={`rotate(-90 ${x + 40} 240)`}
              opacity={h > 150 ? 1 : 0}
            >
              {l}
            </text>
          </g>
        );
      })}
      <rect x={30} y={340} width={400} height={28} rx={6} fill="#cfc8f0" />
      <text x={230} y={362} textAnchor="middle" fontSize={22} fontWeight={800} fill="#2a1c5c" fontFamily="PromptTH">
        ประชาชน
      </text>
    </svg>
  );
};

export const CivilVisual: React.FC<VisualProps> = ({ lines }) => {
  const active = useActiveLine(lines);
  const frame = useCurrentFrame();
  const sectors = useReveal(lines, 0, 10);
  const def = useReveal(lines, 1);
  const ex = useReveal(lines, 2);
  const roles = useReveal(lines, 3);
  const pillar = useReveal(lines, 4);
  const phase2 = interpolate(frame, [lines[3].start - 10, lines[3].start + 6], [0, 1], clamp);
  const examples = ["NGOs", "มูลนิธิ", "สมาคม", "สหกรณ์", "กลุ่มอาสาสมัคร", "เครือข่ายชุมชน"];
  const roleList = [
    { e: "🔍", t: "ตรวจสอบการใช้อำนาจรัฐ" },
    { e: "📢", t: "สะท้อนปัญหาของประชาชน" },
    { e: "🛠️", t: "ร่วมแก้ไขปัญหาสังคม" },
  ];
  return (
    <SidePanel>
      <PanelTitle title="ภาคประชาสังคม" tag="ส่วนที่ 3 · Civil Society" color={C.teal} />
      <div style={{ position: "relative", flex: 1 }}>
        {/* phase 1: definition + sectors + examples */}
        <div style={{ position: "absolute", inset: 0, display: "flex", gap: 20, opacity: 1 - phase2 }}>
          <ThreeSectors p={sectors} focus={def} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
            <Card glow={C.teal} active={active === 1 ? 0.6 : 0} style={{ padding: "18px 22px", fontSize: 28, lineHeight: 1.5, ...pop(def) }}>
              <Emoji e="📖" size={32} /> ประชาชน <b style={{ color: C.teal }}>รวมตัวกันโดยสมัครใจ</b>{" "}
              นอกเหนือภาครัฐและธุรกิจ เพื่อ<b style={{ color: C.gold }}>ประโยชน์ส่วนรวม</b>
            </Card>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {examples.map((e, i) => (
                <div
                  key={e}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 999,
                    fontSize: 27,
                    fontWeight: 600,
                    background: "rgba(61,214,198,0.18)",
                    border: `2px solid ${C.teal}`,
                    ...pop(Math.max(0, Math.min(1, ex * 2 - i * 0.18)), 20),
                  }}
                >
                  {e}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* phase 2: roles + pillars */}
        <div style={{ position: "absolute", inset: 0, display: "flex", gap: 20, alignItems: "center", opacity: phase2 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: C.gold }}>บทบาทสำคัญ</div>
            {roleList.map((r, i) => (
              <Card
                key={r.t}
                glow={C.teal}
                active={active === 3 ? 0.5 : 0}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", fontSize: 29, ...pop(Math.max(0, Math.min(1, roles * 1.8 - i * 0.3)), 20) }}
              >
                <Emoji e={r.e} size={46} /> {r.t}
              </Card>
            ))}
          </div>
          <Pillars p={pillar} />
        </div>
      </div>
    </SidePanel>
  );
};

export const ConnectVisual: React.FC<VisualProps> = ({ lines }) => {
  const frame = useCurrentFrame();
  const a = useReveal(lines, 0, 6);
  const b = useReveal(lines, 1);
  const c = useReveal(lines, 2);
  const d = useReveal(lines, 2, 70);
  const nodes = [
    { e: "🧠", t: "วัฒนธรรมการเมือง\nแบบมีส่วนร่วม", c: C.pink, p: a },
    { e: "🗳️", t: "การมีส่วนร่วม\nทางการเมือง", c: C.gold, p: b },
    { e: "🤝", t: "ภาคประชาสังคม\nที่เข้มแข็ง", c: C.teal, p: c },
  ];
  return (
    <SidePanel>
      <PanelTitle title="ความเชื่อมโยงของทั้งสามเรื่อง" tag="สรุปภาพรวม" color={C.violet} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
        {nodes.map((n, i) => (
          <React.Fragment key={n.t}>
            <Card glow={n.c} active={n.p * 0.6} style={{ width: 270, padding: "22px 10px", textAlign: "center", ...pop(n.p) }}>
              <Emoji e={n.e} size={72} />
              <div style={{ fontSize: 26, fontWeight: 800, whiteSpace: "pre-line", lineHeight: 1.4, marginTop: 8 }}>
                {n.t}
              </div>
            </Card>
            {i < 2 ? (
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  color: C.gold,
                  opacity: nodes[i + 1].p,
                  transform: `translateX(${Math.sin(frame * 0.2 + i) * 6}px)`,
                }}
              >
                ➜
              </div>
            ) : null}
          </React.Fragment>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 64, color: C.gold, opacity: d, marginTop: 6 }}>⬇</div>
      <Card
        glow={C.gold}
        active={d}
        style={{ alignSelf: "center", padding: "22px 50px", textAlign: "center", ...pop(d) }}
      >
        <Emoji e="🏛️" size={64} />
        <div style={{ fontSize: 46, fontWeight: 800, color: C.gold }}>ประชาธิปไตยที่มั่นคง</div>
      </Card>
    </SidePanel>
  );
};
