import requests

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

def _round(n):
    return round(n * 10) / 10

def get_weather(lat, lon):
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m",
        "hourly": "precipitation_probability",
        "timezone": "auto",
    }
    try:
        r = requests.get(OPEN_METEO_URL, params=params, timeout=20)
    except Exception:
        return {"temperature": None, "precipProb": None}
    if r.status_code != 200:
        return {"temperature": None, "precipProb": None}
    ct = r.headers.get("content-type", "").lower()
    if "application/json" not in ct:
        return {"temperature": None, "precipProb": None}
    try:
        j = r.json()
    except Exception:
        return {"temperature": None, "precipProb": None}
    t = j.get("current", {}).get("temperature_2m")
    ct_time = j.get("current", {}).get("time")
    times = j.get("hourly", {}).get("time", [])
    probs = j.get("hourly", {}).get("precipitation_probability", [])
    p = None
    if ct_time and times and probs:
        key = ct_time[:13] + ":00" if isinstance(ct_time, str) and len(ct_time) >= 13 else None
        idx = times.index(key) if key in times else (times.index(ct_time) if ct_time in times else -1)
        if idx >= 0 and isinstance(probs[idx], (int, float)):
            p = int(round(probs[idx]))
    return {"temperature": _round(t) if isinstance(t, (int, float)) else None, "precipProb": p if isinstance(p, int) else None}