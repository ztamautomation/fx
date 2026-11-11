// Basic auth ทั้งเว็บ (user: admin, รหัสจาก env DASHBOARD_PASSWORD) ยกเว้น /api/push ที่ใช้ PUSH_TOKEN ของ Pi
export const config = { matcher: "/((?!api/push).*)" };

function same(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export default function middleware(request) {
  const pw = process.env.DASHBOARD_PASSWORD || "";
  const h = request.headers.get("authorization") || "";
  let given = "";
  try { given = h.startsWith("Basic ") ? atob(h.slice(6)) : ""; } catch { given = ""; }
  if (pw.length >= 12 && same(given, `admin:${pw}`)) return;   // ผ่าน ไปเสิร์ฟหน้าเว็บ/ข้อมูลต่อ
  return new Response("Login required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="trades"', "Cache-Control": "no-store" },
  });
}
