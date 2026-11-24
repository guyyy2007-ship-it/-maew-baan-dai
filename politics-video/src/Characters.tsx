import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Speaker, TIMELINE, TOTAL_FRAMES } from "./data";

// Sizes come from scripts/split.py (2x upscaled crops).
const META = {
  man: { w: 760, h: 1313, pivotX: 406, pivotY: 337 },
  woman: { w: 690, h: 1234, pivotX: 344, pivotY: 374 },
} as const;

const LAYOUT = {
  center: { scale: 0.66, man: 500, woman: 962 },
  side: { scale: 0.56, man: 40, woman: 416 },
};

const ALL_LINES = TIMELINE.flatMap((s) => s.timed);

// Lines that start with a polite bow / greeting nod.
const BOW_LINES = new Set(["0-0", "0-1", "0-2", "8-2", "8-3"]);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 = center layout, 1 = side layout */
const layoutProgress = (frame: number) => {
  const agendaStart = TIMELINE[1].start;
  const outroStart = TIMELINE[TIMELINE.length - 1].start;
  const toSide = interpolate(frame, [agendaStart - 10, agendaStart + 30], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const toCenter = interpolate(frame, [outroStart - 10, outroStart + 30], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return toSide - toCenter;
};

/** Smooth 0..1 "is talking" envelope for a character. */
const talkAmount = (frame: number, who: Speaker) => {
  let v = 0;
  for (const l of ALL_LINES) {
    if (l.speaker !== who) continue;
    const a = l.globalStart;
    const b = l.globalStart + l.duration;
    if (frame < a - 8 || frame > b + 8) continue;
    v = Math.max(v, interpolate(frame, [a - 4, a + 6, b - 4, b + 6], [0, 1, 1, 0], clamp));
  }
  return v;
};

const currentSpeaker = (frame: number): Speaker | null => {
  let s: Speaker | null = null;
  for (const l of ALL_LINES) {
    if (frame >= l.globalStart - 6) s = l.speaker;
  }
  return s;
};

const bowAmount = (frame: number, who: Speaker) => {
  let v = 0;
  for (const l of ALL_LINES) {
    if (l.speaker !== who) continue;
    if (!BOW_LINES.has(`${l.sceneIndex}-${l.lineIndex}`)) continue;
    const a = l.globalStart;
    v = Math.max(
      v,
      interpolate(frame, [a, a + 10, a + 26, a + 40], [0, 1, 1, 0], {
        ...clamp,
        easing: Easing.inOut(Easing.quad),
      }),
    );
  }
  return v;
};

const Character: React.FC<{ who: Speaker }> = ({ who }) => {
  const frame = useCurrentFrame();
  const m = META[who];
  const lp = layoutProgress(frame);
  const scale = interpolate(lp, [0, 1], [LAYOUT.center.scale, LAYOUT.side.scale]);
  let x = interpolate(lp, [0, 1], [LAYOUT.center[who], LAYOUT.side[who]]);

  // Walk-in at the very beginning.
  const phase = who === "man" ? 0 : 1.7;
  const walk = interpolate(frame, [0, 55], [1, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  x += who === "man" ? -900 * walk : 1100 * walk;
  // Short shuffle when switching layouts.
  const moving =
    Math.abs(
      layoutProgress(frame + 1) - layoutProgress(frame - 1),
    ) > 0.001
      ? 1
      : 0;
  const stepping = Math.max(walk > 0.01 ? 1 : 0, moving);
  const step = stepping * Math.abs(Math.sin(frame * 0.38 + phase)) * 16;
  const stepTilt = stepping * Math.sin(frame * 0.38 + phase) * 1.6;

  // Fade to the end of the video.
  const endFade = interpolate(frame, [TOTAL_FRAMES - 20, TOTAL_FRAMES], [1, 0.0], clamp);

  const talk = talkAmount(frame, who);
  const speaker = currentSpeaker(frame);
  const listening = speaker && speaker !== who ? 1 : 0;
  const bow = bowAmount(frame, who);

  // Idle life.
  const breathe = Math.sin(frame * 0.09 + phase) * 0.006;
  const sway = Math.sin(frame * 0.035 + phase) * 0.6;
  const idleHead = Math.sin(frame * 0.05 + phase) * 1.2;

  // Talking: lively nods + small bounce.
  const talkHead =
    talk * (Math.sin(frame * 0.29 + phase) * 2.2 + Math.sin(frame * 0.71) * 0.9);
  const nodY = talk * Math.abs(Math.sin(frame * 0.42 + phase)) * 5;
  const bounce = -talk * Math.abs(Math.sin(frame * 0.21 + phase)) * 6;
  const gesture = talk * Math.sin(frame * 0.13 + phase) * 1.1;

  // Listener looks toward the speaker.
  const lookDir = who === "man" ? 1 : -1;
  const lookHead = listening * lookDir * 3;

  const headRot = idleHead + talkHead + lookHead;
  const headY = nodY + bow * 16;
  const bodyY = step + bounce + bow * 6;
  const bodyRot = sway + gesture + stepTilt;
  const spotlight = 0.25 + talk * 0.75;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        bottom: 0,
        width: m.w * scale,
        height: m.h * scale,
        transform: `translateY(${bodyY}px) rotate(${bodyRot}deg) scaleY(${1 + breathe}) scaleX(${1 - breathe * 0.4})`,
        transformOrigin: "50% 100%",
        opacity: endFade,
      }}
    >
      {/* speaker glow */}
      <div
        style={{
          position: "absolute",
          left: "-15%",
          right: "-15%",
          top: "5%",
          bottom: "-10%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 50% 45%, rgba(255,120,200,${0.35 * spotlight}), rgba(255,120,200,0) 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: m.w,
          height: m.h,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <Img
            src={staticFile(`chars/${who}-body.png`)}
            style={{ position: "absolute", left: 0, top: 0, width: m.w, height: m.h }}
          />
          <Img
            src={staticFile(`chars/${who}-head.png`)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: m.w,
              height: m.h,
              transform: `translateY(${headY}px) rotate(${headRot}deg)`,
              transformOrigin: `${m.pivotX}px ${m.pivotY}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const Characters: React.FC = () => {
  return (
    <AbsoluteFill>
      <Character who="man" />
      <Character who="woman" />
    </AbsoluteFill>
  );
};
