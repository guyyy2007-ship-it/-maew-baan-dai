import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TimedLine } from "./data";

export const C = {
  bg1: "#140f33",
  bg2: "#33195a",
  pink: "#ff4fa3",
  pinkSoft: "#ff9fcf",
  gold: "#ffcc4d",
  teal: "#3dd6c6",
  sky: "#6aa9ff",
  violet: "#a98bff",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.72)",
  card: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.18)",
};

export const EMOJI = '"Noto Color Emoji"';

export type VisualProps = { lines: TimedLine[] };

/** 0→1 spring that starts at the beginning of line `i` (+delay frames). */
export const useReveal = (lines: TimedLine[], i: number, delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = (lines[i]?.start ?? 0) + delay;
  return spring({ frame: frame - start, fps, config: { damping: 15, mass: 0.7 } });
};

/** index of the line currently being spoken (or last one spoken). */
export const useActiveLine = (lines: TimedLine[]) => {
  const frame = useCurrentFrame();
  let idx = 0;
  lines.forEach((l, i) => {
    if (frame >= l.start) idx = i;
  });
  return idx;
};

export const pop = (p: number, dist = 40, fade = 1): React.CSSProperties => ({
  opacity: fade * interpolate(p, [0, 0.6], [0, 1], { extrapolateRight: "clamp" }),
  transform: `translateY(${(1 - p) * dist}px) scale(${0.85 + 0.15 * p})`,
});

export const Card: React.FC<{
  style?: React.CSSProperties;
  children: React.ReactNode;
  glow?: string;
  active?: number;
}> = ({ style, children, glow = C.pink, active = 0 }) => (
  <div
    style={{
      background: `linear-gradient(160deg, rgba(255,255,255,${0.1 + active * 0.06}), rgba(255,255,255,0.04))`,
      border: `2px solid ${active > 0.01 ? glow : C.border}`,
      borderRadius: 28,
      boxShadow: `0 20px 50px rgba(0,0,0,0.35), 0 0 ${active * 40}px ${glow}88`,
      color: C.text,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Emoji: React.FC<{ e: string; size: number; style?: React.CSSProperties }> = ({
  e,
  size,
  style,
}) => (
  <span style={{ fontFamily: EMOJI, fontSize: size, lineHeight: 1, ...style }}>{e}</span>
);

export const PanelTitle: React.FC<{ title: string; tag?: string; color?: string }> = ({
  title,
  tag,
  color = C.pink,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  return (
    <div style={{ marginBottom: 26, ...pop(p, 20) }}>
      {tag ? (
        <div
          style={{
            display: "inline-block",
            background: color,
            color: "#fff",
            fontWeight: 600,
            fontSize: 26,
            padding: "6px 22px",
            borderRadius: 999,
            marginBottom: 12,
          }}
        >
          {tag}
        </div>
      ) : null}
      <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.25, color: C.text }}>
        {title}
      </div>
      <div
        style={{
          height: 6,
          width: 160 * p,
          borderRadius: 3,
          marginTop: 10,
          background: `linear-gradient(90deg, ${color}, ${C.gold})`,
        }}
      />
    </div>
  );
};

/** Right-hand content area used when characters stand on the left. */
export const SidePanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      left: 860,
      top: 70,
      width: 1010,
      height: 790,
      display: "flex",
      flexDirection: "column",
    }}
  >
    {children}
  </div>
);
