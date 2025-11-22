const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function buildBbox(bbox) {
  if (!bbox) return null;
  return `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
}

function uniqNames(elements) {
  const s = new Set();
  const out = [];
  for (const el of elements) {
    const name = el?.tags?.name;
    if (!name) continue;
    if (s.has(name)) continue;
    s.add(name);
    out.push(name);
    if (out.length >= 5) break;
  }
  return out;
}

export async function getTopPlaces(bbox) {
  const b = buildBbox(bbox);
  if (!b) return [];
  const payload = `[out:json][timeout:25];(
    node["tourism"="attraction"](${b});way["tourism"="attraction"](${b});relation["tourism"="attraction"](${b});
    node["tourism"="museum"](${b});way["tourism"="museum"](${b});relation["tourism"="museum"](${b});
    node["tourism"="zoo"](${b});way["tourism"="zoo"](${b});relation["tourism"="zoo"](${b});
    node["tourism"="theme_park"](${b});way["tourism"="theme_park"](${b});relation["tourism"="theme_park"](${b});
    node["amenity"="park"](${b});way["amenity"="park"](${b});relation["amenity"="park"](${b});
    node["leisure"="park"](${b});way["leisure"="park"](${b});relation["leisure"="park"](${b});
    node["leisure"="garden"](${b});way["leisure"="garden"](${b});relation["leisure"="garden"](${b});
    node["historic"](${b});way["historic"](${b});relation["historic"](${b});
    node["amenity"="planetarium"](${b});way["amenity"="planetarium"](${b});relation["amenity"="planetarium"](${b});
    node["amenity"="theatre"](${b});way["amenity"="theatre"](${b});relation["amenity"="theatre"](${b});
  );out tags;`;
  const q = `data=${encodeURIComponent(payload)}`;
  let res;
  try {
    res = await fetch(OVERPASS_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" }, body: q });
  } catch {
    return [];
  }
  if (!res.ok) return [];
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) return [];
  let j;
  try {
    j = await res.json();
  } catch {
    return [];
  }
  const elements = Array.isArray(j && j.elements) ? j.elements : [];
  return uniqNames(elements);
}