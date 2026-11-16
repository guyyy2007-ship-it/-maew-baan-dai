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
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="แมวบ้านใด"><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#120a2e">
</head><body>${body}</body></html>`;
const app = express();
app.get('/', (_req, res) => res.type('html').send(page));
const remotePage = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#1d1233">
</head><body>${readFileSync(join(here, 'remote.html'), 'utf8')}</body></html>`;
app.get('/remote', (_req, res) => res.type('html').send(remotePage));
app.get('/manifest.webmanifest', (_req, res) => res.type('application/manifest+json').send(JSON.stringify({
  name: 'แมวบ้านใด', short_name: 'แมวบ้านใด', start_url: '/', display: 'fullscreen', orientation: 'portrait',
  background_color: '#120a2e', theme_color: '#120a2e' })));
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
// ---------- manual (remote control) room: no TikTok connection, events come from /remote ----------
const REMOTE_PIN = String(process.env.REMOTE_PIN || '').trim();
const manual = { games: new Set(), remotes: new Set() };
function manualStatus() {
  const msg = { type: 'status', state: manual.remotes.size ? 'live' : 'waiting',
    message: manual.remotes.size ? `โหมดรีโมต: รีโมตเชื่อมอยู่ ${manual.remotes.size} เครื่อง` : 'โหมดรีโมต: รอรีโมตเชื่อมต่อ (เปิด /remote บนเครื่องที่ 2)' };
  for (const g of manual.games) send(g, msg);
  for (const r of manual.remotes) send(r, { type: 'remoteStatus', games: manual.games.size });
}
const cleanText = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, n);
export function remoteEvent(raw) {
  let m; try { m = JSON.parse(raw); } catch { return null; }
  if (m?.type === 'reset') return { type: 'reset' };
  const name = cleanText(m?.name, 24); if (!name) return null;
  const user = { id: 'm_' + name.toLowerCase(), name, avatar: '' };
  if (m.type === 'comment') return { type: 'comment', user };
  if (m.type === 'gift') {
    const coins = Math.max(0, Math.min(100000, Number(m.coins) || 0));
    const count = Math.max(1, Math.min(99, Number(m.count) || 1));
    return { type: 'gift', user, gift: { name: cleanText(m.gift, 30), coins, count } };
  }
  return null;
}
wss.on('connection', (ws, req) => {
  const q = new URL(req.url, 'http://local').searchParams;
  if (q.get('role') === 'remote') {
    if (REMOTE_PIN && q.get('pin') !== REMOTE_PIN) { send(ws, { type: 'remoteStatus', error: 'pin' }); ws.close(); return; }
    manual.remotes.add(ws); manualStatus();
    ws.on('message', raw => { const ev = remoteEvent(String(raw)); if (ev) for (const g of manual.games) send(g, ev); });
    ws.on('close', () => { manual.remotes.delete(ws); manualStatus(); });
    return;
  }
  if (q.get('mode') === 'manual') {
    manual.games.add(ws); manualStatus();
    ws.on('close', () => { manual.games.delete(ws); manualStatus(); });
    return;
  }
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
  const conn = new TikTokLiveConnection(room.name, { signApiKey: SIGN_API_KEY, processInitialData: false, enableExtendedGiftInfo: true, fetchRoomInfoOnConnect: false });
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
    const noRoom = /room id/i.test(msg);
    if (/requir|api key|unauthori|401|403/i.test(msg) && /sign/i.test(msg)) {
      setStatus(room, 'waiting', `ต่อไลฟ์ไม่ได้: ต้องใส่ SIGN_API_KEY จาก eulerstream.com ใน Render ก่อน (จะลองใหม่ใน 30 วินาที)`);
      scheduleRetry(room, 30); return;
    }
    setStatus(room, 'waiting', offline ? `@${room.name} ยังไม่ได้เริ่มไลฟ์ จะลองใหม่ทุก 30 วินาที`
      : noRoom ? `หาห้องไลฟ์ของ @${room.name} ไม่เจอ (ยังไม่ได้ไลฟ์ หรือชื่อช่องไม่ถูก) จะลองใหม่ทุก 30 วินาที`
      : `ยังเชื่อมต่อ @${room.name} ไม่ได้ จะลองใหม่ใน 30 วินาที (${msg.slice(0, 100)})`);
    scheduleRetry(room, 30);
  }
}

server.listen(PORT, () => console.log(`แมวบ้านใด running on port ${PORT}`));
export { server, wss };
