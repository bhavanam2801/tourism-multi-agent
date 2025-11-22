import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

def geocode_place(query):
    params = {"format": "jsonv2", "q": query, "limit": 1, "addressdetails": 0}
    headers = {"Accept": "application/json", "User-Agent": "tourism-multi-agent-python/1.0"}
    try:
        r = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=20)
    except Exception:
        return None
    if r.status_code != 200:
        return None
    try:
        arr = r.json()
    except Exception:
        return None
    if not isinstance(arr, list) or not arr:
        return None
    x = arr[0]
    lat = x.get("lat")
    lon = x.get("lon")
    if not lat or not lon:
        return None
    bbox_arr = x.get("boundingbox", [])
    bbox = None
    if isinstance(bbox_arr, list) and len(bbox_arr) == 4:
        bbox = {
            "south": float(bbox_arr[0]),
            "north": float(bbox_arr[1]),
            "west": float(bbox_arr[2]),
            "east": float(bbox_arr[3]),
        }
    return {"name": x.get("display_name", query), "lat": float(lat), "lon": float(lon), "bbox": bbox}