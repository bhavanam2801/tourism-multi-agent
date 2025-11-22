import http from "http";
import { runTourismAgent } from "./agents/parent.js";
import { geocodePlace } from "./services/nominatim.js";
import { getTopPlaces } from "./agents/places.js";
import { getWeather } from "./agents/weather.js";

function send(res, status, body, type = "text/plain") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function htmlPage() {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tourism Multi-Agent</title></head><body><h1>Tourism Multi-Agent</h1><form action="/query" method="get"><label>Enter your query:</label><input name="text" style="width:480px" placeholder="I'm going to go to Bangalore, let's plan my trip."/><button type="submit">Submit</button></form><p>Endpoints:</p><ul><li>/query?text=...</li><li>/places?place=...</li><li>/weather?place=...</li></ul></body></html>`;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/") {
      return send(res, 200, htmlPage(), "text/html");
    }
    if (req.method === "GET" && url.pathname === "/query") {
      const text = (url.searchParams.get("text") || "").trim();
      if (!text) return send(res, 400, "Missing text query");
      const out = await runTourismAgent(text);
      return send(res, 200, out);
    }
    if (req.method === "GET" && url.pathname === "/places") {
      const place = (url.searchParams.get("place") || "").trim();
      if (!place) return send(res, 400, "Missing place parameter");
      const geo = await geocodePlace(place);
      if (!geo) return send(res, 200, "I don't know this place exist");
      const names = await getTopPlaces(geo.bbox);
      const body = names.length ? names.join("\n") : "No popular places were found.";
      return send(res, 200, body);
    }
    if (req.method === "GET" && url.pathname === "/weather") {
      const place = (url.searchParams.get("place") || "").trim();
      if (!place) return send(res, 400, "Missing place parameter");
      const geo = await geocodePlace(place);
      if (!geo) return send(res, 200, "I don't know this place exist");
      const w = await getWeather(geo.lat, geo.lon);
      const temp = typeof w.temperature === "number" ? `${w.temperature}°C` : "unknown";
      const prob = typeof w.precipProb === "number" ? `${w.precipProb}%` : "unknown";
      const body = `In ${place} it’s currently ${temp} with a chance of ${prob} to rain.`;
      return send(res, 200, body);
    }
    return send(res, 404, "Not found");
  } catch {
    return send(res, 500, "Unexpected error");
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
