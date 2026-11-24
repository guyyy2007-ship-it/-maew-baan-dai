# คลิปนำเสนอ: วัฒนธรรมทางการเมือง · การมีส่วนร่วมทางการเมือง · ภาคประชาสังคม

วิดีโอแนวนอน 1920×1080, 30fps, ยาว 5:00 นาที สร้างด้วย Remotion

- ตัวละคร 2 คน (ตัดฉากเขียวแล้ว แยกหัว/ลำตัวให้ขยับได้) อยู่ใน `public/chars/`
- บทพูดทั้งหมดและเวลาของแต่ละฉากอยู่ใน `src/data.ts`
- บทพากย์พร้อมเวลา: `บทพากย์-voiceover.md` และซับไตเติล `subtitles.srt`

## ใส่เสียงพากย์ AI
1. สร้างเสียงตามบทใน `บทพากย์-voiceover.md` (มีเวลาเริ่มของแต่ละประโยค)
2. วางไฟล์ เช่น `public/voice.mp3` แล้วแก้ `defaultProps={{ voiceover: "voice.mp3" }}` ใน `src/Root.tsx`
   หรือจะนำ `out/presentation.mp4` ไปใส่เสียงในโปรแกรมตัดต่อ (CapCut ฯลฯ) ก็ได้
3. ถ้าเสียงยาว/สั้นกว่า ปรับ `seconds` ของแต่ละฉากใน `src/data.ts`

## คำสั่ง
```
npm i
npx remotion studio                 # ดูตัวอย่าง
npx remotion render PoliticsPresentation out/presentation.mp4
node scripts/stills.mjs 100 900     # เรนเดอร์ภาพนิ่ง
npx tsx scripts/export-script.ts    # สร้างบทพากย์/ซับใหม่หลังแก้ data.ts
```
