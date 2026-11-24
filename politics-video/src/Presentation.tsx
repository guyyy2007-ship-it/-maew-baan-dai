import "./fonts";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Characters } from "./Characters";
import { VideoCharacters } from "./VideoCharacters";
import { PEOPLE, SECTIONS, TIMELINE, TimedScene, VisualId } from "./data";
import { FONT_STACK } from "./fonts";
import { C, VisualProps } from "./ui";
import { IntroVisual } from "./visuals/Intro";
import { OutroVisual } from "./visuals/Outro";
import { AgendaVisual, CultureVisual, ThaiVisual, TypesVisual } from "./visuals/Section1";
import { CivilVisual, ConnectVisual, ParticipationVisual } from "./visuals/Section23";

const VISUALS: Record<VisualId, React.FC<VisualProps>> = {
  intro: IntroVisual,
  agenda: AgendaVisual,
  culture: CultureVisual,
  types: TypesVisual,
  thai: ThaiVisual,
  participation: ParticipationVisual,
  civil: CivilVisual,
  connect: ConnectVisual,
  outro: OutroVisual,
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 20%, ${C.bg2}, ${C.bg1} 70%)`,
      }}
    >
      {/* soft floating blobs */}
      {[
        { x: 200, y: 180, r: 420, c: "rgba(255,79,163,0.20)", s: 0.011 },
        { x: 1500, y: 260, r: 520, c: "rgba(106,169,255,0.16)", s: 0.008 },
        { x: 1150, y: 900, r: 480, c: "rgba(61,214,198,0.12)", s: 0.013 },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x + Math.sin(frame * b.s + i) * 60 - b.r / 2,
            top: b.y + Math.cos(frame * b.s * 1.3 + i) * 40 - b.r / 2,
            width: b.r,
            height: b.r,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.c}, transparent 70%)`,
          }}
        />
      ))}
      {/* subtle Thai-pattern-ish diamond grid */}
      <svg width="1920" height="1080" style={{ position: "absolute", opacity: 0.06 }}>
        <defs>
          <pattern id="dia" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 4 L76 40 L40 76 L4 40 Z" fill="none" stroke="#fff" strokeWidth="2" />
            <circle cx="40" cy="40" r="5" fill="#fff" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#dia)" transform={`translate(${(frame * 0.3) % 80} 0)`} />
      </svg>
      {/* stage floor */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 260,
          background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

const SceneLayer: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const V = VISUALS[scene.id];
  const opacity = interpolate(
    frame,
    [0, 14, scene.duration - 12, scene.duration],
    [0, 1, 1, 0],
    clamp,
  );
  const lines = scene.timed;
  return (
    <AbsoluteFill style={{ opacity }}>
      <V lines={lines} />
    </AbsoluteFill>
  );
};

const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const all = TIMELINE.flatMap((s) => s.timed);
  const line = all.find((l) => frame >= l.globalStart - 4 && frame < l.globalStart + l.duration + 6);
  if (!line) return null;
  const local = frame - line.globalStart;
  const o = interpolate(local, [-4, 4, line.duration, line.duration + 6], [0, 1, 1, 0], clamp);
  const color = line.speaker === "man" ? C.sky : C.pink;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 34,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${(1 - o) * 12}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          background: "rgba(12,8,30,0.82)",
          borderRadius: 22,
          padding: "14px 30px 16px",
          borderLeft: `8px solid ${color}`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 600, color }}>{PEOPLE[line.speaker].name}</div>
        <div style={{ fontSize: 34, color: "#fff", lineHeight: 1.45 }}>{line.text}</div>
      </div>
    </div>
  );
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const sceneIdx = TIMELINE.findIndex((s) => frame >= s.start && frame < s.start + s.duration);
  const scene = TIMELINE[Math.max(0, sceneIdx)];
  const sideScenes = TIMELINE.slice(1, -1);
  const visible = interpolate(
    frame,
    [TIMELINE[1].start + 10, TIMELINE[1].start + 30, TIMELINE[TIMELINE.length - 1].start - 10, TIMELINE[TIMELINE.length - 1].start],
    [0, 1, 1, 0],
    clamp,
  );
  const colors = [C.pink, C.gold, C.teal];
  const totalSide = sideScenes.reduce((a, s) => a + s.duration, 0);
  const prog = interpolate(frame, [TIMELINE[1].start, TIMELINE[1].start + totalSide], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 40, top: 30, width: 780, opacity: visible }}>
      <div style={{ display: "flex", gap: 10 }}>
        {SECTIONS.map((s, i) => {
          const on = scene.section === i + 1;
          return (
            <div
              key={s}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: 20,
                fontWeight: 600,
                color: on ? "#fff" : C.muted,
                background: on ? colors[i] : "rgba(255,255,255,0.08)",
                border: `2px solid ${on ? colors[i] : "rgba(255,255,255,0.15)"}`,
              }}
            >
              {i + 1}. {s}
            </div>
          );
        })}
      </div>
      <div style={{ height: 6, marginTop: 12, borderRadius: 3, background: "rgba(255,255,255,0.1)" }}>
        <div
          style={{
            width: `${prog * 100}%`,
            height: "100%",
            borderRadius: 3,
            background: `linear-gradient(90deg, ${C.pink}, ${C.gold}, ${C.teal})`,
          }}
        />
      </div>
    </div>
  );
};

export type PresentationProps = { voiceover: string; characterMode: "video" | "puppet" };

export const Presentation: React.FC<PresentationProps> = ({ voiceover, characterMode }) => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT_STACK, color: "#fff" }}>
      <Background />
      {TIMELINE.map((scene) => (
        <Sequence
          key={scene.id}
          name={scene.title}
          from={scene.start}
          durationInFrames={scene.duration}
          premountFor={30}
        >
          <SceneLayer scene={scene} />
        </Sequence>
      ))}
      {characterMode === "video" ? <VideoCharacters /> : <Characters />}
      <Progress />
      <Subtitles />
      {voiceover ? <Audio src={staticFile(voiceover)} /> : null}
    </AbsoluteFill>
  );
};
