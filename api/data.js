// GET /api/data?f=trades|bots  (ผ่าน basic auth ใน middleware แล้ว) คืน JSON ล่าสุดที่ Pi ส่งมา
import { redis } from "./_redis.js";

export async function GET(request) {
  const f = new URL(request.url).searchParams.get("f");
  if (f !== "trades" && f !== "bots") return new Response("bad f", { status: 400 });
  const body = await redis("GET", `dash:${f}`);
  if (!body) return new Response("No data yet", { status: 503 });
  return new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
