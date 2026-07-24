// Netlify Function: same FantasyPros proxy (exposed at /api/fp via the redirect in netlify.toml).
export async function handler(event) {
  const sc = ((event.queryStringParameters && event.queryStringParameters.scoring) || "PPR").toUpperCase();
  const scoring = ["PPR", "HALF", "STD"].includes(sc) ? sc : "PPR";
  const target = "https://partners.fantasypros.com/api/v1/consensus-rankings.php?sport=NFL&year=2026&week=0&position=ALL&type=ST&scoring=" + scoring + "&export=json";
  try {
    const res = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" } });
    const body = await res.text();
    return { statusCode: res.status, headers: { "content-type": "application/json", "access-control-allow-origin": "*", "cache-control": "public, max-age=21600" }, body };
  } catch (e) {
    return { statusCode: 502, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }, body: JSON.stringify({ error: String(e) }) };
  }
}
