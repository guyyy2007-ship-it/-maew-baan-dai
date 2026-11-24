import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SECTIONS } from "../data";
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

export const AgendaVisual: React.FC<VisualProps> = ({ lines }) => {
  const frame = useCurrentFrame();
  const l1 = lines[1];
  const items = [
    { t: SECTIONS[0], e: "🧠", c: C.pink },
    { t: SECTIONS[1], e: "🗳️", c: C.gold },
    { t: SECTIONS[2], e: "🤝", c: C.teal },
    { t: "ความเชื่อมโยง & สรุป", e: "🔗", c: C.violet },
  ];
  return (
    <SidePanel>
      <PanelTitle title="หัวข้อการนำเสนอ" tag="Agenda" />
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {items.map((it, i) => {
          const start =
            i < 3 ? l1.start + (i * l1.duration) / 3 : lines[2].start;
          const p = interpolate(frame - start, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const appear = interpolate(frame, [lines[0].start + i * 6, lines[0].start + i * 6 + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <Card
              key={it.t}
              glow={it.c}
              active={p}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "20px 30px",
                ...pop(appear, 30),
                transform: `translateX(${(1 - appear) * 60 + p * 14}px)`,
              }}
            >
              <div
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 37,
                  background: it.c,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 38,
                  fontWeight: 800,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: 42, fontWeight: 600, flex: 1 }}>{it.t}</div>
              <Emoji e={it.e} size={60} style={{ transform: `scale(${1 + p * 0.2})` }} />
            </Card>
          );
        })}
      </div>
    </SidePanel>
  );
};

export const CultureVisual: React.FC<VisualProps> = ({ lines }) => {
  const def = useReveal(lines, 1);
  const tri = useReveal(lines, 2);
  const soc = useReveal(lines, 3);
  const frame = useCurrentFrame();
  const orient = [
    { e: "🧠", t: "คิด", s: "ความรู้ ความเข้าใจ" },
    { e: "❤️", t: "รู้สึก", s: "ความผูกพัน ศรัทธา" },
    { e: "📣", t: "แสดงออก", s: "การประเมิน & พฤติกรรม" },
  ];
  const agents = [
    { e: "👨‍👩‍👧", t: "ครอบครัว" },
    { e: "🏫", t: "โรงเรียน" },
    { e: "📺", t: "สื่อมวลชน" },
    { e: "👫", t: "กลุ่มเพื่อน" },
  ];
  return (
    <SidePanel>
      <PanelTitle title="วัฒนธรรมทางการเมือง" tag="ส่วนที่ 1 · Political Culture" />
      <Card style={{ padding: "22px 30px", marginBottom: 22, ...pop(def) }} glow={C.pink} active={def * 0.6}>
        <div style={{ fontSize: 30, lineHeight: 1.55 }}>
          <Emoji e="📖" size={34} /> <b style={{ color: C.gold }}>ความหมาย:</b> แบบแผนของ{" "}
          <b style={{ color: C.pinkSoft }}>ความรู้ ความเชื่อ ค่านิยม และทัศนคติ</b>{" "}
          ที่ประชาชนมีต่อระบบการเมือง
        </div>
      </Card>
      <div style={{ display: "flex", gap: 20, marginBottom: 26 }}>
        {orient.map((o, i) => {
          const p = Math.max(0, Math.min(1, tri * 1.5 - i * 0.25));
          return (
            <Card key={o.t} style={{ flex: 1, padding: "18px 10px", textAlign: "center", ...pop(p) }} glow={C.gold} active={p * 0.5}>
              <Emoji e={o.e} size={64} style={{ display: "inline-block", transform: `translateY(${Math.sin(frame * 0.1 + i) * 4}px)` }} />
              <div style={{ fontSize: 36, fontWeight: 800, color: C.gold }}>{o.t}</div>
              <div style={{ fontSize: 24, color: C.muted }}>{o.s}</div>
            </Card>
          );
        })}
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, color: C.teal, marginBottom: 12, ...pop(soc, 20) }}>
        หล่อหลอมผ่าน “การขัดเกลาทางสังคม”
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {agents.map((a, i) => {
          const p = Math.max(0, Math.min(1, soc * 1.6 - i * 0.2));
          return (
            <div
              key={a.t}
              style={{
                flex: 1,
                borderRadius: 22,
                padding: "14px 6px",
                textAlign: "center",
                background: "rgba(61,214,198,0.14)",
                border: `2px solid ${C.teal}`,
                ...pop(p),
              }}
            >
              <Emoji e={a.e} size={52} />
              <div style={{ fontSize: 26, fontWeight: 600, marginTop: 4 }}>{a.t}</div>
            </div>
          );
        })}
      </div>
    </SidePanel>
  );
};

export const TypesVisual: React.FC<VisualProps> = ({ lines }) => {
  const active = useActiveLine(lines);
  const frame = useCurrentFrame();
  const head = useReveal(lines, 0, 6);
  const mixed = useReveal(lines, 4, 10);
  const types = [
    {
      e: "🏡",
      t: "แบบคับแคบ",
      en: "Parochial",
      d: "ไม่รู้ ไม่สนใจ การเมืองเป็นเรื่องไกลตัว",
      lv: 0.2,
      c: C.sky,
    },
    {
      e: "🙇",
      t: "แบบไพร่ฟ้า",
      en: "Subject",
      d: "รู้ แต่ยอมรับอำนาจรัฐ ไม่คิดจะเปลี่ยนแปลง",
      lv: 0.55,
      c: C.gold,
    },
    {
      e: "🙋",
      t: "แบบมีส่วนร่วม",
      en: "Participant",
      d: "ตื่นตัว รู้สิทธิหน้าที่ พร้อมมีบทบาท",
      lv: 0.95,
      c: C.pink,
    },
  ];
  return (
    <SidePanel>
      <PanelTitle title="ประเภทของวัฒนธรรมทางการเมือง" tag="Almond & Verba (1963)" />
      <div style={{ display: "flex", gap: 20, height: 460 }}>
        {types.map((ty, i) => {
          const appear = Math.max(0, Math.min(1, head * 1.5 - i * 0.25));
          const on = active === i + 1 ? 1 : 0;
          const bar = interpolate(frame - (lines[i + 1]?.start ?? 0), [0, 30], [0, ty.lv], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <Card
              key={ty.t}
              glow={ty.c}
              active={on}
              style={{
                flex: 1,
                padding: "22px 18px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                ...pop(appear),
                transform: `translateY(${(1 - appear) * 40 - on * 14}px) scale(${1 + on * 0.04})`,
                opacity: appear * (active >= 1 && active <= 3 && !on ? 0.55 : 1),
              }}
            >
              <Emoji e={ty.e} size={84} />
              <div style={{ fontSize: 36, fontWeight: 800, color: ty.c, marginTop: 8 }}>{ty.t}</div>
              <div style={{ fontSize: 24, color: C.muted, fontStyle: "italic" }}>{ty.en}</div>
              <div style={{ fontSize: 25, lineHeight: 1.45, marginTop: 12, flex: 1 }}>{ty.d}</div>
              <div style={{ width: "100%", fontSize: 20, color: C.muted, textAlign: "left" }}>
                ระดับการมีส่วนร่วม
              </div>
              <div style={{ width: "100%", height: 18, borderRadius: 9, background: "rgba(255,255,255,0.12)", marginTop: 6 }}>
                <div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 9, background: ty.c }} />
              </div>
            </Card>
          );
        })}
      </div>
      <Card
        glow={C.teal}
        active={mixed}
        style={{ marginTop: 26, padding: "18px 28px", fontSize: 30, ...pop(mixed) }}
      >
        <Emoji e="💡" size={36} /> สังคมจริงส่วนใหญ่เป็น <b style={{ color: C.gold }}>แบบผสม</b> —
        แบบมีส่วนร่วมคือ <b style={{ color: C.pinkSoft }}>รากฐานของประชาธิปไตย</b>
      </Card>
    </SidePanel>
  );
};

export const ThaiVisual: React.FC<VisualProps> = ({ lines }) => {
  const frame = useCurrentFrame();
  const a = useReveal(lines, 1);
  const b = useReveal(lines, 2);
  const arrow = useReveal(lines, 3);
  const head = useReveal(lines, 0, 6);
  const Col: React.FC<{ title: string; color: string; items: [string, string][]; p: number }> = ({
    title,
    color,
    items,
    p,
  }) => (
    <Card glow={color} active={p * 0.6} style={{ flex: 1, padding: "22px 22px", ...pop(p) }}>
      <div style={{ fontSize: 34, fontWeight: 800, color, marginBottom: 14, textAlign: "center" }}>
        {title}
      </div>
      {items.map(([e, t], i) => {
        const q = Math.max(0, Math.min(1, p * 1.6 - i * 0.25));
        return (
          <div
            key={t}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 29,
              marginBottom: 14,
              padding: "10px 14px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.07)",
              ...pop(q, 20),
            }}
          >
            <Emoji e={e} size={44} /> {t}
          </div>
        );
      })}
    </Card>
  );
  return (
    <SidePanel>
      <PanelTitle title="วัฒนธรรมทางการเมืองไทย" tag="ลักษณะผสมผสาน" color={C.gold} />
      <div style={{ display: "flex", alignItems: "center", gap: 18, ...pop(head, 10) }}>
        <Col
          title="แบบดั้งเดิม"
          color={C.gold}
          p={a}
          items={[
            ["🤝", "ระบบอุปถัมภ์"],
            ["🙏", "เคารพผู้อาวุโส"],
            ["👑", "พึ่งพาผู้มีอำนาจ"],
          ]}
        />
        <div style={{ textAlign: "center", width: 90, opacity: arrow }}>
          <div
            style={{
              fontSize: 80,
              color: C.teal,
              transform: `translateX(${Math.sin(frame * 0.2) * 8}px)`,
              fontWeight: 800,
            }}
          >
            ➜
          </div>
          <div style={{ fontSize: 20, color: C.teal, fontWeight: 600 }}>เปลี่ยนผ่าน</div>
        </div>
        <Col
          title="แนวโน้มใหม่"
          color={C.teal}
          p={b}
          items={[
            ["🎓", "การศึกษาสูงขึ้น"],
            ["📱", "สื่อออนไลน์"],
            ["✊", "คนรุ่นใหม่ตื่นตัว"],
          ]}
        />
      </div>
      <Card
        glow={C.pink}
        active={arrow}
        style={{ marginTop: 28, padding: "18px 28px", fontSize: 32, textAlign: "center", ...pop(arrow) }}
      >
        <Emoji e="🇹🇭" size={38} /> กำลังก้าวสู่ <b style={{ color: C.pinkSoft }}>วัฒนธรรมแบบมีส่วนร่วม</b>
      </Card>
    </SidePanel>
  );
};
