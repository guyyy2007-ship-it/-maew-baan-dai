import { writeFileSync } from "fs";
import { FPS, PEOPLE, TIMELINE } from "../src/data";
const ts = (f: number, sep = ",") => {
  const ms = Math.round((f / FPS) * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(h)}:${p(m)}:${p(s)}${sep}${p(ms % 1000, 3)}`;
};
let srt = "", md = "# บทพากย์ — วัฒนธรรมทางการเมือง การมีส่วนร่วมทางการเมือง และภาคประชาสังคม\n\n", n = 1;
for (const sc of TIMELINE) {
  md += `## ${sc.title}  (${ts(sc.start, ".").slice(3, 8)} – ${ts(sc.start + sc.duration, ".").slice(3, 8)})\n\n`;
  for (const l of sc.timed) {
    srt += `${n++}\n${ts(l.globalStart)} --> ${ts(l.globalStart + l.duration)}\n${l.text}\n\n`;
    md += `- **[${ts(l.globalStart, ".").slice(3, 8)}] ${l.speaker === "man" ? "🧑 " : "👩 "}${PEOPLE[l.speaker].name}:** ${l.text}  _(≈${(l.duration / FPS).toFixed(1)} วินาที)_\n`;
  }
  md += "\n";
}
writeFileSync("บทพากย์-voiceover.md", md);
writeFileSync("subtitles.srt", srt);
