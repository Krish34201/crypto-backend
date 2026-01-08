const express = require("express");
const bip39 = require("bip39");

const app = express();

/* =========================
   BASIC CONFIG
========================= */
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY; // set in Koyeb

let running = false;
let phrasesGenerated = 0;

/* =========================
   CORS (SAFE)
========================= */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // later restrict
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-KEY");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

/* =========================
   SIMPLE AUTH (PROTECT START/STOP)
========================= */
app.use((req, res, next) => {
  if (req.path === "/status") return next(); // status is public

  const key = req.headers["x-api-key"];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

/* =========================
   CRYPTO LOOP
========================= */
function loop() {
  if (!running) return;

  bip39.generateMnemonic();
  phrasesGenerated++;

  setImmediate(loop);
}

/* =========================
   ROUTES
========================= */
app.post("/start", (req, res) => {
  if (!running) {
    running = true;
    loop();
  }
  res.json({ ok: true, running });
});

app.post("/stop", (req, res) => {
  running = false;
  res.json({ ok: true, running });
});

app.get("/status", (req, res) => {
  res.json({
    running,
    phrasesGenerated,
  });
});

/* =========================
   SAFETY
========================= */
process.on("uncaughtException", (err) => {
  console.error("CRASH:", err);
});

app.listen(PORT, () => {
  console.log(`Crypto backend running on port ${PORT}`);
});
