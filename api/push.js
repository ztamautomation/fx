// POST /api/push  Authorization: Bearer <PUSH_TOKEN>  body {"trades": {...}, "bots": {...}}  (Pi ส่งทุก 5 นาที)
import { redis } from "./_redis.js";

const MAX = 1_000_000;

function same(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function POST(request) {
  const tok = process.env.PUSH_TOKEN || "";
  const h = request.headers.get("authorization") || "";
  if (tok.length < 24 || !same(h, `Bearer ${tok}`)) return new Response("unauthorized", { status: 401 });
  const text = await request.text();
  if (text.length > MAX) return new Response("too large", { status: 413 });
  let j;
  try { j = JSON.parse(text); } catch { return new Response("bad json", { status: 400 }); }
  if (!j || typeof j.trades !== "object" || typeof j.bots !== "object") return new Response("need trades and bots", { status: 400 });
  await redis("SET", "dash:trades", JSON.stringify(j.trades));
  await redis("SET", "dash:bots", JSON.stringify(j.bots));
  if (j.trades_exness && typeof j.trades_exness === "object") await redis("SET", "dash:trades_exness", JSON.stringify(j.trades_exness));
  return new Response("ok");
}
