export const FPS = 30;

export type Speaker = "man" | "woman";
export type Layout = "center" | "side";
export type VisualId =
  | "intro"
  | "agenda"
  | "culture"
  | "types"
  | "thai"
  | "participation"
  | "civil"
  | "connect"
  | "outro";

export type Line = { speaker: Speaker; text: string };

export type Scene = {
  id: VisualId;
  section: 0 | 1 | 2 | 3; // 0 = none, 1..3 = section number
  title: string;
  seconds: number;
  layout: Layout;
  lines: Line[];
};

export const PEOPLE = {
  man: { name: "สิบเอก กันต์ธร ทองอ่อน", short: "ส.อ.กันต์ธร" },
  woman: { name: "นางสาวกุลธิดา ไวว่อง", short: "กุลธิดา" },
} as const;

export const SECTIONS = [
  "วัฒนธรรมทางการเมือง",
  "การมีส่วนร่วมทางการเมือง",
  "ภาคประชาสังคม",
];

export const SCENES: Scene[] = [
  {
    id: "intro",
    section: 0,
    title: "แนะนำตัว",
    seconds: 30,
    layout: "center",
    lines: [
      {
        speaker: "woman",
        text: "สวัสดีค่ะทุกท่าน ยินดีต้อนรับเข้าสู่การนำเสนองานของพวกเรานะคะ",
      },
      { speaker: "man", text: "สวัสดีครับ กระผม สิบเอก กันต์ธร ทองอ่อน ครับ" },
      { speaker: "woman", text: "และดิฉัน นางสาวกุลธิดา ไวว่อง ค่ะ" },
      {
        speaker: "man",
        text: "วันนี้พวกเราจะมานำเสนอเรื่อง วัฒนธรรมทางการเมือง การมีส่วนร่วมทางการเมือง และภาคประชาสังคม ครับ",
      },
      {
        speaker: "woman",
        text: "ทั้งสามเรื่องเกี่ยวข้องกับพวกเราทุกคนในฐานะพลเมือง ไปติดตามกันเลยค่ะ",
      },
    ],
  },
  {
    id: "agenda",
    section: 0,
    title: "หัวข้อการนำเสนอ",
    seconds: 15,
    layout: "side",
    lines: [
      { speaker: "man", text: "เนื้อหาในวันนี้แบ่งออกเป็นสามส่วนหลักครับ" },
      {
        speaker: "man",
        text: "ส่วนแรก วัฒนธรรมทางการเมือง ส่วนที่สอง การมีส่วนร่วมทางการเมือง และส่วนที่สาม ภาคประชาสังคม",
      },
      { speaker: "man", text: "และปิดท้ายด้วยความเชื่อมโยงของทั้งสามเรื่องครับ" },
    ],
  },
  {
    id: "culture",
    section: 1,
    title: "วัฒนธรรมทางการเมือง คืออะไร?",
    seconds: 35,
    layout: "side",
    lines: [
      {
        speaker: "man",
        text: "เริ่มจากส่วนแรก วัฒนธรรมทางการเมือง หรือ Political Culture ครับ",
      },
      {
        speaker: "man",
        text: "หมายถึง แบบแผนของความรู้ ความเชื่อ ค่านิยม และทัศนคติ ที่ประชาชนมีต่อระบบการเมือง",
      },
      {
        speaker: "man",
        text: "ซึ่งเป็นตัวกำหนดว่าประชาชนจะคิด รู้สึก และแสดงออกทางการเมืองอย่างไร",
      },
      {
        speaker: "man",
        text: "วัฒนธรรมทางการเมืองถูกหล่อหลอมผ่านการขัดเกลาทางสังคม เช่น ครอบครัว โรงเรียน สื่อมวลชน และกลุ่มเพื่อน ครับ",
      },
    ],
  },
  {
    id: "types",
    section: 1,
    title: "ประเภทของวัฒนธรรมทางการเมือง",
    seconds: 50,
    layout: "side",
    lines: [
      {
        speaker: "woman",
        text: "อัลมอนด์ และ เวอร์บา นักรัฐศาสตร์ชาวอเมริกัน แบ่งวัฒนธรรมทางการเมืองออกเป็นสามแบบค่ะ",
      },
      {
        speaker: "woman",
        text: "แบบแรก แบบคับแคบ ประชาชนไม่รู้และไม่สนใจการเมือง มองว่าเป็นเรื่องไกลตัว",
      },
      {
        speaker: "woman",
        text: "แบบที่สอง แบบไพร่ฟ้า ประชาชนรู้เรื่องการเมือง แต่ยอมรับอำนาจรัฐ และไม่คิดว่าตนเองจะเปลี่ยนแปลงอะไรได้",
      },
      {
        speaker: "woman",
        text: "แบบที่สาม แบบมีส่วนร่วม ประชาชนตื่นตัว รู้สิทธิและหน้าที่ และพร้อมเข้าไปมีบทบาททางการเมือง",
      },
      {
        speaker: "woman",
        text: "ในความเป็นจริง สังคมส่วนใหญ่เป็นแบบผสม และวัฒนธรรมแบบมีส่วนร่วม คือรากฐานสำคัญของประชาธิปไตยค่ะ",
      },
    ],
  },
  {
    id: "thai",
    section: 1,
    title: "วัฒนธรรมทางการเมืองไทย",
    seconds: 30,
    layout: "side",
    lines: [
      {
        speaker: "man",
        text: "สำหรับสังคมไทย วัฒนธรรมทางการเมืองมีลักษณะผสมผสานครับ",
      },
      {
        speaker: "man",
        text: "มีทั้งระบบอุปถัมภ์ การเคารพผู้อาวุโส และการพึ่งพาผู้มีอำนาจ ที่สืบทอดมาจากอดีต",
      },
      {
        speaker: "man",
        text: "ขณะเดียวกัน คนรุ่นใหม่ก็ตื่นตัวทางการเมืองมากขึ้น ผ่านการศึกษาและสื่อออนไลน์",
      },
      {
        speaker: "man",
        text: "สะท้อนว่าสังคมไทยกำลังเปลี่ยนผ่าน ไปสู่วัฒนธรรมแบบมีส่วนร่วมมากขึ้นครับ",
      },
    ],
  },
  {
    id: "participation",
    section: 2,
    title: "การมีส่วนร่วมทางการเมือง",
    seconds: 50,
    layout: "side",
    lines: [
      { speaker: "woman", text: "ส่วนที่สอง การมีส่วนร่วมทางการเมือง ค่ะ" },
      {
        speaker: "woman",
        text: "หมายถึง กิจกรรมที่ประชาชนทำโดยสมัครใจ เพื่อมีอิทธิพลต่อการตัดสินใจของรัฐ หรือการเลือกผู้ปกครอง",
      },
      {
        speaker: "woman",
        text: "รูปแบบที่พบบ่อยที่สุด คือ การไปใช้สิทธิเลือกตั้ง ซึ่งเป็นทั้งสิทธิและหน้าที่ของพลเมือง",
      },
      {
        speaker: "woman",
        text: "นอกจากนี้ยังมีการร่วมรณรงค์หาเสียง การติดต่อเจ้าหน้าที่รัฐ การเข้าชื่อเสนอกฎหมาย และการชุมนุมโดยสงบ",
      },
      {
        speaker: "woman",
        text: "ปัจจุบันยังมีการมีส่วนร่วมผ่านช่องทางออนไลน์ เช่น การลงชื่อสนับสนุนแคมเปญ และการแสดงความคิดเห็นอย่างสร้างสรรค์ค่ะ",
      },
    ],
  },
  {
    id: "civil",
    section: 3,
    title: "ภาคประชาสังคม",
    seconds: 45,
    layout: "side",
    lines: [
      { speaker: "man", text: "ส่วนที่สาม ภาคประชาสังคม หรือ Civil Society ครับ" },
      {
        speaker: "man",
        text: "คือ พื้นที่ที่ประชาชนรวมตัวกันโดยสมัครใจ อยู่นอกเหนือภาครัฐและภาคธุรกิจ เพื่อทำประโยชน์ส่วนรวม",
      },
      {
        speaker: "man",
        text: "ตัวอย่างเช่น องค์กรพัฒนาเอกชน หรือ NGOs มูลนิธิ สมาคม สหกรณ์ กลุ่มอาสาสมัคร และเครือข่ายชุมชน",
      },
      {
        speaker: "man",
        text: "บทบาทสำคัญคือ ตรวจสอบการใช้อำนาจรัฐ สะท้อนปัญหาของประชาชน และร่วมแก้ไขปัญหาสังคม",
      },
      {
        speaker: "man",
        text: "ภาคประชาสังคมที่เข้มแข็ง จึงเปรียบเสมือนเสาหลักที่ค้ำจุนประชาธิปไตยครับ",
      },
    ],
  },
  {
    id: "connect",
    section: 0,
    title: "ความเชื่อมโยงของทั้งสามเรื่อง",
    seconds: 25,
    layout: "side",
    lines: [
      { speaker: "woman", text: "ทั้งสามเรื่องนี้เชื่อมโยงกันอย่างแนบแน่นค่ะ" },
      {
        speaker: "woman",
        text: "วัฒนธรรมทางการเมืองแบบมีส่วนร่วม ทำให้ประชาชนอยากเข้าไปมีส่วนร่วมทางการเมือง",
      },
      {
        speaker: "woman",
        text: "และเมื่อประชาชนรวมพลังกัน ก็ก่อเกิดเป็นภาคประชาสังคมที่เข้มแข็ง นำไปสู่ประชาธิปไตยที่มั่นคงค่ะ",
      },
    ],
  },
  {
    id: "outro",
    section: 0,
    title: "สรุป",
    seconds: 20,
    layout: "center",
    lines: [
      {
        speaker: "man",
        text: "สรุปได้ว่า ประชาธิปไตยจะเข้มแข็งได้ ต้องเริ่มจากพลเมืองทุกคนครับ",
      },
      {
        speaker: "woman",
        text: "มาร่วมกันเรียนรู้ ตื่นตัว และมีส่วนร่วมทางการเมืองอย่างสร้างสรรค์นะคะ",
      },
      { speaker: "man", text: "ขอบคุณที่รับชมครับ" },
      { speaker: "woman", text: "ขอบคุณค่ะ สวัสดีค่ะ" },
    ],
  },
];

export type TimedLine = Line & {
  start: number; // relative to scene
  duration: number;
  globalStart: number;
  sceneIndex: number;
  lineIndex: number;
};

export type TimedScene = Scene & {
  start: number;
  duration: number;
  timed: TimedLine[];
};

const LEAD_IN = 12; // frames of silence at start of each scene
const GAP = 8; // frames between lines

export const buildTimeline = (): TimedScene[] => {
  let cursor = 0;
  return SCENES.map((scene, sceneIndex) => {
    const duration = Math.round(scene.seconds * FPS);
    const usable = duration - LEAD_IN - GAP * scene.lines.length;
    const weights = scene.lines.map((l) => l.text.length + 12);
    const total = weights.reduce((a, b) => a + b, 0);
    let t = LEAD_IN;
    const timed = scene.lines.map((line, lineIndex) => {
      const d = Math.round((usable * weights[lineIndex]) / total);
      const item: TimedLine = {
        ...line,
        start: t,
        duration: d,
        globalStart: cursor + t,
        sceneIndex,
        lineIndex,
      };
      t += d + GAP;
      return item;
    });
    const result: TimedScene = { ...scene, start: cursor, duration, timed };
    cursor += duration;
    return result;
  });
};

export const TIMELINE = buildTimeline();
export const TOTAL_FRAMES = TIMELINE.reduce((a, s) => a + s.duration, 0);
