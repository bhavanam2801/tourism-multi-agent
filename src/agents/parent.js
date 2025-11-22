import { geocodePlace } from "../services/nominatim.js";
import { getWeather } from "./weather.js";
import { getTopPlaces } from "./places.js";

function lower(s) { return s.toLowerCase(); }

function extractPlace(text) {
  const p1 = /go to\s+([^,\.?]+)/i.exec(text);
  if (p1 && p1[1]) return p1[1].trim();
  const p2 = /going to\s+([^,\.?]+)/i.exec(text);
  if (p2 && p2[1]) return p2[1].trim();
  const p3 = /in\s+([^,\.?]+)/i.exec(text);
  if (p3 && p3[1]) return p3[1].trim();
  const p4 = /visit\s+([^,\.?]+)/i.exec(text);
  if (p4 && p4[1]) return p4[1].trim();
  return null;
}

function detectIntents(text) {
  const t = lower(text);
  const needWeather = t.includes("temperature") || t.includes("weather");
  const needPlaces = t.includes("places") || t.includes("visit") || t.includes("plan my trip");
  return { needWeather, needPlaces };
}

function formatWeather(placeName, w) {
  const temp = typeof w.temperature === "number" ? `${w.temperature}°C` : "unknown";
  const prob = typeof w.precipProb === "number" ? `${w.precipProb}%` : "unknown";
  return `In ${placeName} it’s currently ${temp} with a chance of ${prob} to rain.`;
}

function formatPlaces(placeName, places) {
  if (!places.length) return `In ${placeName} no popular places were found.`;
  return [`In ${placeName} these are the places you can go,`, ...places].join("\n");
}

export async function runTourismAgent(input) {
  const placeText = extractPlace(input);
  if (!placeText) return "I don't know this place exist";
  const intents = detectIntents(input);
  const geo = await geocodePlace(placeText);
  if (!geo) return "I don't know this place exist";
  const name = placeText;
  if (intents.needWeather && intents.needPlaces) {
    const results = await Promise.allSettled([
      getWeather(geo.lat, geo.lon),
      getTopPlaces(geo.bbox)
    ]);
    const w = results[0].status === "fulfilled" ? results[0].value : { temperature: null, precipProb: null };
    const p = results[1].status === "fulfilled" ? results[1].value : [];
    const first = formatWeather(name, w);
    const second = p.length ? `And these are the places you can go:\n${p.join("\n")}` : "And no popular places were found.";
    return `${first} ${second}`;
  }
  if (intents.needWeather) {
    const w = await getWeather(geo.lat, geo.lon);
    return formatWeather(name, w);
  }
  const p = await getTopPlaces(geo.bbox);
  return formatPlaces(name, p);
}