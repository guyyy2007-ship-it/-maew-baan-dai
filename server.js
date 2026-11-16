// แมวบ้านใด: serves the game page and forwards TikTok LIVE comments/gifts to it over a WebSocket.
import express from 'express';
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { WebSocketServer } from 'ws';
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const USERNAME = (process.env.TIKTOK_USERNAME || '').trim().replace(/^@/, '');
const SIGN_API_KEY = (process.env.SIGN_API_KEY || '').trim() || undefined;

// ---------- web page ----------
const body = readFileSync(join(here, 'index.html'), 'utf8').replace(
  '<script>',
  `<script>window.MAEW_WS=(location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws';</script>\n<script>`
);
const page = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="theme-color" content="#120a2e">
</head><body>${body}</body></html>`;
const app = express();
app.get('/', (_req, res) => res.type('html').send(page));
app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.get('/status', (_req, res) => res.json([...rooms.values()].map(r => ({ channel: r.name, state: r.state, message: r.message, pages: r.clients.size }))));
const server = http.createServer(app);

// ---------- channels ----------
// Each game page asks for a channel with /ws?u=<username>. Pages that ask for the same channel share one TikTok connection.
const MAX_CHANNELS = Number(process.env.MAX_CHANNELS) || 3;
const wss = new WebSocketServer({ server, path: '/ws' });
const rooms = new Map();
export function cleanName(v) {
  let u = String(v || '').trim();
  const m = u.match(/tiktok\.com\/@([^/?#]+)/i); if (m) u = m[1];
  u = u.replace(/^@/, '');
  return /^[A-Za-z0-9._]{2,24}$/.test(u) ? u.toLowerCase() : '';
}
function send(ws, obj) { if (ws.readyState === 1) ws.send(JSON.stringify(obj)); }
function roomBroadcast(room, obj) { for (const ws of room.clients) send(ws, obj); }
function setStatus(room, state, message) {
  room.state = state; room.message = message;
  console.log(`[@${room.name}] ${state}: ${message}`);
  roomBroadcast(room, { type: 'status', state, message, channel: room.name });
}
function getRoom(name) {
  let room = rooms.get(name);
  if (room) { clearTimeout(room.idleTimer); return room; }
  if (rooms.size >= MAX_CHANNELS) return null;
  room = { name, clients: new Set(), conn: null, state: 'starting', message: 'กำลังเริ่มระบบ...', retryTimer: null, idleTimer: null, streaks: new Map(), closed: false };
  rooms.set(name, room);
  if (process.env.NO_TIKTOK !== '1') connectTikTok(room);
  return room;
}
function leaveRoom(room, ws) {
  room.clients.delete(ws);
  if (room.clients.size === 0) room.idleTimer = setTimeout(() => closeRoom(room), 90 * 1000);
}
async function closeRoom(room) {
  room.closed = true; clearTimeout(room.retryTimer); rooms.delete(room.name);
  try { if (room.conn) await room.conn.disconnect(); } catch {}
  console.log(`[@${room.name}] closed (no game pages open)`);
}
wss.on('connection', (ws, req) => {
  const q = new URL(req.url, 'http://local').searchParams;
  const name = cleanName(q.get('u')) || USERNAME.toLowerCase();
  if (!name) { send(ws, { type: 'status', state: 'no-username', message: 'ยังไม่ได้ใส่ชื่อช่อง พิมพ์ชื่อช่อง TikTok ในแผงควบคุม' }); return; }
  const room = getRoom(name);
  if (!room) { send(ws, { type: 'status', state: 'busy', message: `เซิร์ฟเวอร์ต่อได้พร้อมกันสูงสุด ${MAX_CHANNELS} ช่อง ปิดหน้าเกมของช่องอื่นก่อน` }); return; }
  room.clients.add(ws);
  send(ws, { type: 'status', state: room.state, message: room.message, channel: room.name });
  ws.on('close', () => leaveRoom(room, ws));
});
setInterval(() => { for (const ws of wss.clients) if (ws.readyState === 1) ws.ping(); }, 25000);

// ---------- normalise TikTok data ----------
function pickUser(u = {}) {
  const id = String(u.userId || u.idStr || u.id || u.uniqueId || u.displayId || '');
  const name = u.nickname || u.uniqueId || u.displayId || 'คนดู';
  const avatar =
    u.profilePictureUrl ||
    u.profilePicture?.url?.[0] || u.profilePicture?.urls?.[0] ||
    u.avatarThumb?.urlList?.[0] || u.avatarThumb?.url?.[0] ||
    u.avatarLarge?.urlList?.[0] || u.avatarLarge?.url?.[0] || '';
  return { id, name: String(name).slice(0, 24), avatar: typeof avatar === 'string' ? avatar : '' };
}
export function onChat(room, data) {
  const user = pickUser(data.user || data);
  if (!user.id) return;
  roomBroadcast(room, { type: 'comment', user, text: String(data.comment || '').slice(0, 120) });
}
// Streak gifts (giftType 1) arrive repeatedly with a growing repeatCount; forward only the new part each time.
export function onGift(room, data) {
  const user = pickUser(data.user || data);
  if (!user.id) return;
  const d = data.giftDetails || {};
  const ext = data.extendedGiftInfo || {};
  const giftId = data.giftId ?? d.id ?? ext.id;
  const name = d.giftName || ext.name || data.giftName || '';
  const coins = Number(d.diamondCount ?? ext.diamond_count ?? data.diamondCount ?? 0);
  const giftType = d.giftType ?? data.giftType;
  const repeat = Math.max(1, Number(data.repeatCount || 1));
  let count = repeat;
  if (giftType === 1) {
    const key = `${user.id}:${giftId}:${data.groupId ?? ''}`;
    const seen = room.streaks.get(key) || 0;
    count = repeat - seen;
    if (data.repeatEnd) room.streaks.delete(key); else room.streaks.set(key, repeat);
    if (count <= 0) return;
  }
  roomBroadcast(room, { type: 'gift', user, gift: { id: giftId, name, coins, count } });
}
export { getRoom, rooms };

// ---------- TikTok LIVE connection (keeps retrying while a game page is open) ----------
function scheduleRetry(room, sec) { clearTimeout(room.retryTimer); if (!room.closed) room.retryTimer = setTimeout(() => connectTikTok(room), sec * 1000); }
async function connectTikTok(room) {
  if (room.closed) return;
  try { if (room.conn) await room.conn.disconnect(); } catch {}
  const conn = new TikTokLiveConnection(room.name, { signApiKey: SIGN_API_KEY, processInitialData: false, enableExtendedGiftInfo: true });
  room.conn = conn;
  conn.on(WebcastEvent.CHAT, d => { try { onChat(room, d); } catch (e) { console.error(e); } });
  conn.on(WebcastEvent.GIFT, d => { try { onGift(room, d); } catch (e) { console.error(e); } });
  conn.on(WebcastEvent.STREAM_END, () => { setStatus(room, 'ended', 'ไลฟ์จบแล้ว รอไลฟ์รอบใหม่...'); scheduleRetry(room, 30); });
  conn.on('disconnected', () => { if (room.state === 'live' && !room.closed) { setStatus(room, 'reconnecting', 'หลุดจากไลฟ์ กำลังต่อใหม่...'); scheduleRetry(room, 5); } });
  conn.on('error', e => console.error(`[@${room.name}]`, e?.message || e));
  setStatus(room, 'connecting', `กำลังเชื่อมต่อไลฟ์ของ @${room.name}...`);
  try {
    const state = await conn.connect();
    if (room.closed) { try { await conn.disconnect(); } catch {} return; }
    setStatus(room, 'live', `เชื่อมต่อไลฟ์ @${room.name} แล้ว`);
  } catch (e) {
    const msg = String(e?.message || e);
    const offline = /offline|not.*live|UserOffline/i.test(msg) || e?.name === 'UserOfflineError';
    setStatus(room, 'waiting', offline ? `@${room.name} ยังไม่ได้เริ่มไลฟ์ จะลองใหม่ทุก 30 วินาที` : `ยังเชื่อมต่อ @${room.name} ไม่ได้ จะลองใหม่ใน 30 วินาที (${msg.slice(0, 100)})`);
    scheduleRetry(room, 30);
  }
}

server.listen(PORT, () => console.log(`แมวบ้านใด running on port ${PORT}`));
export { server, wss };
