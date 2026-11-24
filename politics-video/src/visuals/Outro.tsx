import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PEOPLE } from "../data";
import { C, Emoji, pop, useReveal, VisualProps } from "../ui";

export const OutroVisual: React.FC<VisualProps> = ({ lines }) => {
  const frame = useCurrentFrame();
  const a = useReveal(lines, 0, 8);
  const b = useReveal(lines, 1);
  const thanks = useReveal(lines, 2);
  const out = interpolate(thanks, [0, 1], [1, 0]);
  const words = [
    { t: "เรียนรู้", e: "📚", c: C.sky },
    { t: "ตื่นตัว", e: "💡", c: C.gold },
    { t: "มีส่วนร่วม", e: "🙌", c: C.pink },
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 36, width: "100%", textAlign: "center", ...pop(a, 20, out) }}>
        <div style={{ fontSize: 30, color: C.muted, fontWeight: 600 }}>สรุป</div>
        <div style={{ fontSize: 58, fontWeight: 800, color: "#fff" }}>
          ประชาธิปไตยเข้มแข็ง <span style={{ color: C.gold }}>เริ่มที่พลเมืองทุกคน</span>
        </div>
      </div>
      {/* keywords on the sides */}
      {words.map((w, i) => {
        const p = Math.max(0, Math.min(1, b * 1.6 - i * 0.25)) * out;
        const left = i === 0;
        const right = i === 2;
        const style: React.CSSProperties = left
          ? { left: 80, top: 360 }
          : right
            ? { right: 80, top: 360 }
            : { left: 80, top: 560 };
        return (
          <div
            key={w.t}
            style={{
              position: "absolute",
              ...style,
              padding: "18px 34px",
              borderRadius: 999,
              background: "rgba(20,12,50,0.8)",
              border: `3px solid ${w.c}`,
              fontSize: 46,
              fontWeight: 800,
              color: "#fff",
              boxShadow: `0 0 30px ${w.c}66`,
              ...pop(p, 30),
            }}
          >
            <Emoji e={w.e} size={48} /> {w.t}
          </div>
        );
      })}
      {/* thanks */}
      <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", ...pop(thanks, 30) }}>
        <div style={{ fontSize: 110, fontWeight: 800, color: "#fff", textShadow: `0 0 40px ${C.pink}` }}>
          ขอบคุณ<span style={{ color: C.pinkSoft }}>ที่รับชม</span> <Emoji e="🙏" size={96} />
        </div>
      </div>
      {[
        { n: PEOPLE.man.name, side: "left" as const, c: C.sky },
        { n: PEOPLE.woman.name, side: "right" as const, c: C.pink },
      ].map((x) => (
        <div
          key={x.n}
          style={{
            position: "absolute",
            top: 560,
            [x.side]: 24,
            width: 466,
            whiteSpace: "nowrap",
            padding: "20px 26px",
            borderRadius: 24,
            background: "rgba(20,12,50,0.78)",
            border: `3px solid ${x.c}`,
            fontSize: 34,
            fontWeight: 800,
            color: "#fff",
            textAlign: x.side,
            ...pop(thanks, 30),
          }}
        >
          {x.n}
        </div>
      ))}
      {thanks > 0.5
        ? new Array(30).fill(0).map((_, i) => {
            const t = frame - lines[2].start;
            const x = (i * 157) % 1920;
            const y = ((t * (3 + (i % 4)) + i * 90) % 1200) - 100;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: 14,
                  height: 22,
                  background: [C.pink, C.gold, C.teal, C.sky][i % 4],
                  transform: `rotate(${t * 6 + i * 30}deg)`,
                  borderRadius: 3,
                  opacity: 0.85,
                }}
              />
            );
          })
        : null}
    </AbsoluteFill>
  );
};
