const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocodePlace(query) {
  const u = new URL(NOMINATIM_URL);
  u.searchParams.set("format", "jsonv2");
  u.searchParams.set("q", query);
  u.searchParams.set("limit", "1");
  u.searchParams.set("addressdetails", "0");
  const res = await fetch(u.toString(), {
    headers: {
      "Accept": "application/json",
      "User-Agent": "tourism-multi-agent/1.0"
    }
  });
  if (!res.ok) return null;
  const arr = await res.json();
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const r = arr[0];
  if (!r || !r.lat || !r.lon) return null;
  const bboxArr = r.boundingbox || [];
  const bbox = bboxArr.length === 4 ? {
    south: parseFloat(bboxArr[0]),
    north: parseFloat(bboxArr[1]),
    west: parseFloat(bboxArr[2]),
    east: parseFloat(bboxArr[3])
  } : null;
  return {
    name: r.display_name || query,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    bbox
  };
}