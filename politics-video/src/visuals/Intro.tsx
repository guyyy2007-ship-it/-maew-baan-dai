import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PEOPLE, SECTIONS } from "../data";
import { C, Emoji, pop, useReveal, VisualProps } from "../ui";

const NameCard: React.FC<{
  p: number;
  name: string;
  side: "left" | "right";
  color: string;
}> = ({ p, name, side, color }) => (
  <div
    style={{
      position: "absolute",
      top: 560,
      [side]: 20,
      width: 390,
      padding: "26px 30px",
      borderRadius: 26,
      background: "rgba(20,12,50,0.78)",
      border: `3px solid ${color}`,
      boxShadow: `0 0 40px ${color}66`,
      textAlign: side === "left" ? "left" : "right",
      ...pop(p, 30),
    }}
  >
    <div style={{ fontSize: 24, color: C.muted, fontWeight: 600 }}>ผู้นำเสนอ</div>
    <div style={{ fontSize: 29, fontWeight: 800, color: "#fff", lineHeight: 1.35, whiteSpace: "nowrap" }}>
      {name}
    </div>
    <div
      style={{
        height: 5,
        width: `${p * 100}%`,
        marginTop: 10,
        borderRadius: 3,
        background: `linear-gradient(90deg, ${color}, ${C.gold})`,
      }}
    />
  </div>
);

export const IntroVisual: React.FC<VisualProps> = ({ lines }) => {
  const frame = useCurrentFrame();
  const hello = useReveal(lines, 0, 0);
  const man = useReveal(lines, 1, 10);
  const woman = useReveal(lines, 2, 6);
  const topic = useReveal(lines, 3, 10);
  const all = useReveal(lines, 4, 0);
  const helloOut = interpolate(topic, [0, 1], [1, 0]);

  return (
    <AbsoluteFill>
      {/* greeting */}
      <div
        style={{
          position: "absolute",
          top: 40,
          width: "100%",
          textAlign: "center",
          ...pop(hello, 30, helloOut),
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 800, color: "#fff" }}>
          สวัสดีค่ะ / ครับ <Emoji e="🙏" size={80} />
        </div>
        <div style={{ fontSize: 34, color: C.pinkSoft, fontWeight: 600 }}>
          ยินดีต้อนรับสู่การนำเสนองาน
        </div>
      </div>

      {/* topic */}
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 22,
        }}
      >
        {SECTIONS.map((s, i) => {
          const p = interpolate(topic, [0, 1], [0, 1]) * 1;
          const d = Math.max(0, Math.min(1, p * 1.6 - i * 0.3));
          const colors = [C.pink, C.gold, C.teal];
          return (
            <div
              key={s}
              style={{
                padding: "16px 30px",
                borderRadius: 999,
                background: "rgba(20,12,50,0.8)",
                border: `3px solid ${colors[i]}`,
                fontSize: 38,
                fontWeight: 800,
                color: "#fff",
                boxShadow: `0 0 ${20 + all * 30}px ${colors[i]}77`,
                ...pop(d, 30),
              }}
            >
              <span style={{ color: colors[i] }}>{i + 1}.</span> {s}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: 120,
          width: "100%",
          textAlign: "center",
          fontSize: 30,
          color: C.muted,
          fontWeight: 600,
          ...pop(all, 20),
        }}
      >
        <Emoji e="🏛️" size={34} /> เรื่องใกล้ตัวของพลเมืองทุกคน{" "}
        <Emoji e="🇹🇭" size={34} />
      </div>

      <NameCard p={man} name={PEOPLE.man.name} side="left" color={C.sky} />
      <NameCard p={woman} name={PEOPLE.woman.name} side="right" color={C.pink} />

      {/* sparkles */}
      {new Array(14).fill(0).map((_, i) => {
        const x = (i * 137) % 1920;
        const y = 200 + ((i * 263) % 600);
        const t = Math.sin(frame * 0.07 + i) * 0.5 + 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 8,
              height: 8,
              borderRadius: 4,
              background: i % 2 ? C.gold : C.pinkSoft,
              opacity: t * 0.6,
              transform: `scale(${0.6 + t})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
