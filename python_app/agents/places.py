import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def _build_bbox(bbox):
    if not bbox:
        return None
    return f"{bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']}"

def _uniq_names(elements):
    s = set()
    out = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue
        if name in s:
            continue
        s.add(name)
        out.append(name)
        if len(out) >= 5:
            break
    return out

def get_top_places(bbox):
    b = _build_bbox(bbox)
    if not b:
        return []
    payload = (
        f"[out:json][timeout:25];("
        f"node['tourism'='attraction']({b});way['tourism'='attraction']({b});relation['tourism'='attraction']({b});"
        f"node['tourism'='museum']({b});way['tourism'='museum']({b});relation['tourism'='museum']({b});"
        f"node['tourism'='zoo']({b});way['tourism'='zoo']({b});relation['tourism'='zoo']({b});"
        f"node['tourism'='theme_park']({b});way['tourism'='theme_park']({b});relation['tourism'='theme_park']({b});"
        f"node['amenity'='park']({b});way['amenity'='park']({b});relation['amenity'='park']({b});"
        f"node['leisure'='park']({b});way['leisure'='park']({b});relation['leisure'='park']({b});"
        f"node['leisure'='garden']({b});way['leisure'='garden']({b});relation['leisure'='garden']({b});"
        f"node['historic']({b});way['historic']({b});relation['historic']({b});"
        f"node['amenity'='planetarium']({b});way['amenity'='planetarium']({b});relation['amenity'='planetarium']({b});"
        f"node['amenity'='theatre']({b});way['amenity'='theatre']({b});relation['amenity'='theatre']({b});"
        f");out tags;"
    )
    data = {"data": payload}
    try:
        r = requests.post(OVERPASS_URL, data=data, headers={"Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded"}, timeout=25)
    except Exception:
        return []
    if r.status_code != 200:
        return []
    ct = r.headers.get("content-type", "").lower()
    if "application/json" not in ct:
        return []
    try:
        j = r.json()
    except Exception:
        return []
    elements = j.get("elements", []) if isinstance(j, dict) else []
    return _uniq_names(elements)