import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Loop,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Speaker, TIMELINE, TOTAL_FRAMES } from "./data";

/**
 * Animated (AI-generated) green-screen clips, already keyed to transparent
 * WebM with scripts/make-clip.sh. Each clip contains BOTH presenters.
 * `null` = not provided yet → falls back to another available clip.
 */
export const CLIPS: Record<Speaker, string | null> = {
  man: "clips/man-talk.webm", // ส.อ.กันต์ธร พูด, กุลธิดา ฟัง
  woman: null, // TODO: กุลธิดา พูด, ส.อ.กันต์ธร ฟัง
};
// ping-pong loop length of the clips (frames @30fps)
const CLIP_FRAMES = 476;
// keyed clip frame size
const CW = 1864;
const CH = 1360;

const clipFor = (s: Speaker) => CLIPS[s] ?? CLIPS.man ?? CLIPS.woman;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const XFADE = 8;

type Segment = { speaker: Speaker; from: number; to: number };

const buildSegments = (): Segment[] => {
  const lines = TIMELINE.flatMap((s) => s.timed);
  const segs: Segment[] = [];
  for (const l of lines) {
    const last = segs[segs.length - 1];
    if (last && clipFor(last.speaker) === clipFor(l.speaker)) continue;
    if (last) last.to = l.globalStart;
    segs.push({ speaker: l.speaker, from: segs.length ? l.globalStart : 0, to: TOTAL_FRAMES });
  }
  return segs;
};
const SEGMENTS = buildSegments();

const layoutProgress = (frame: number) => {
  const agendaStart = TIMELINE[1].start;
  const outroStart = TIMELINE[TIMELINE.length - 1].start;
  const e = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  return (
    interpolate(frame, [agendaStart - 10, agendaStart + 30], [0, 1], e) -
    interpolate(frame, [outroStart - 10, outroStart + 30], [0, 1], e)
  );
};

export const VideoCharacters: React.FC = () => {
  const frame = useCurrentFrame();
  const lp = layoutProgress(frame);
  // center: big in the middle; side: on the left of the content panel
  const h = interpolate(lp, [0, 1], [860, 640]);
  const w = (h * CW) / CH;
  const left = interpolate(lp, [0, 1], [(1920 - (860 * CW) / CH) / 2, -10]);
  const enter = interpolate(frame, [0, 25], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const endFade = interpolate(frame, [TOTAL_FRAMES - 20, TOTAL_FRAMES], [1, 0], clamp);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left,
          bottom: 0,
          width: w,
          height: h,
          opacity: enter * endFade,
          transform: `translateY(${(1 - enter) * 80}px)`,
        }}
      >
        {SEGMENTS.map((s, i) => {
          const from = Math.max(0, s.from - (i ? XFADE : 0));
          const dur = s.to - from;
          return (
            <Sequence key={i} from={from} durationInFrames={dur} premountFor={30}>
              <SegmentClip src={clipFor(s.speaker)!} fadeIn={i > 0} dur={dur} />
            </Sequence>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SegmentClip: React.FC<{ src: string; fadeIn: boolean; dur: number }> = ({ src, fadeIn }) => {
  const f = useCurrentFrame();
  const opacity = fadeIn ? interpolate(f, [0, XFADE], [0, 1], clamp) : 1;
  return (
    <AbsoluteFill style={{ opacity }}>
      <Loop durationInFrames={CLIP_FRAMES}>
        <OffthreadVideo
          src={staticFile(src)}
          transparent
          muted
          style={{ width: "100%", height: "100%" }}
        />
      </Loop>
    </AbsoluteFill>
  );
};
