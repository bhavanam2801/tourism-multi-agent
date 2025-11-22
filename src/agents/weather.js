const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

function round(n) {
  return Math.round(n * 10) / 10;
}

export async function getWeather(lat, lon) {
  const u = new URL(OPEN_METEO_URL);
  u.searchParams.set("latitude", String(lat));
  u.searchParams.set("longitude", String(lon));
  u.searchParams.set("current", "temperature_2m");
  u.searchParams.set("hourly", "precipitation_probability");
  u.searchParams.set("timezone", "auto");
  let res;
  try {
    res = await fetch(u.toString(), { headers: { "Accept": "application/json" } });
  } catch {
    return { temperature: null, precipProb: null };
  }
  if (!res.ok) return { temperature: null, precipProb: null };
  const ctype = (res.headers.get("content-type") || "").toLowerCase();
  if (!ctype.includes("application/json")) return { temperature: null, precipProb: null };
  let j;
  try {
    j = await res.json();
  } catch {
    return { temperature: null, precipProb: null };
  }
  const t = j?.current?.temperature_2m;
  const ct = j?.current?.time;
  const times = j?.hourly?.time || [];
  const probs = j?.hourly?.precipitation_probability || [];
  let p = null;
  if (ct && times.length && probs.length) {
    let key = null;
    if (typeof ct === "string" && ct.length >= 13) key = ct.slice(0, 13) + ":00";
    let idx = key ? times.indexOf(key) : -1;
    if (idx < 0) idx = times.indexOf(ct);
    if (idx >= 0 && typeof probs[idx] === "number") p = probs[idx];
  }
  return { temperature: typeof t === "number" ? round(t) : null, precipProb: typeof p === "number" ? Math.round(p) : null };
}