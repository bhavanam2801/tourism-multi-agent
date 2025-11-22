import re
from services.nominatim import geocode_place
from agents.weather import get_weather
from agents.places import get_top_places

def _lower(s):
    return s.lower()

def _extract_place(text):
    m = re.search(r"go to\s+([^,\.\?]+)", text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    m = re.search(r"going to\s+([^,\.\?]+)", text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    m = re.search(r"in\s+([^,\.\?]+)", text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    m = re.search(r"visit\s+([^,\.\?]+)", text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return None

def _detect_intents(text):
    t = _lower(text)
    need_weather = ("temperature" in t) or ("weather" in t)
    need_places = ("places" in t) or ("visit" in t) or ("plan my trip" in t)
    return need_weather, need_places

def _format_weather(place_name, w):
    temp = f"{w['temperature']}°C" if isinstance(w.get('temperature'), (int, float)) else "unknown"
    prob = f"{w['precipProb']}%" if isinstance(w.get('precipProb'), (int, float)) else "unknown"
    return f"In {place_name} it’s currently {temp} with a chance of {prob} to rain."

def _format_places(place_name, places):
    if not places:
        return f"In {place_name} no popular places were found."
    return "\n".join([f"In {place_name} these are the places you can go,", *places])

def run_tourism_agent(input_text):
    place_text = _extract_place(input_text)
    if not place_text:
        return "I don't know this place exist"
    need_weather, need_places = _detect_intents(input_text)
    geo = geocode_place(place_text)
    if not geo:
        return "I don't know this place exist"
    name = place_text
    if need_weather and need_places:
        w = get_weather(geo["lat"], geo["lon"])
        p = get_top_places(geo.get("bbox"))
        first = _format_weather(name, w)
        second = f"And these are the places you can go:\n" + "\n".join(p) if p else "And no popular places were found."
        return f"{first} {second}"
    if need_weather:
        w = get_weather(geo["lat"], geo["lon"])
        return _format_weather(name, w)
    p = get_top_places(geo.get("bbox"))
    return _format_places(name, p)