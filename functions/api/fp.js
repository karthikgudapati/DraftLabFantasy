// Cloudflare Pages Function: proxy FantasyPros so a browser on the deployed domain isn't CORS-blocked.
// Only the `scoring` param is passed through (locked to the known FP endpoint — not an open proxy).
export async function onRequest(context) {
  const sc = (new URL(context.request.url).searchParams.get("scoring") || "PPR").toUpperCase();
  const scoring = ["PPR", "HALF", "STD"].includes(sc) ? sc : "PPR";
  const target = "https://partners.fantasypros.com/api/v1/consensus-rankings.php?sport=NFL&year=2026&week=0&position=ALL&type=ST&scoring=" + scoring + "&export=json";
  try {
    const res = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" } });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*", "cache-control": "public, max-age=21600" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 502, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });
  }
}
