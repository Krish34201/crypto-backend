const express = require("express");
const bip39 = require("bip39");

const app = express();

let running = false;
let phrasesGenerated = 0;

function loop() {
  if (!running) return;

  bip39.generateMnemonic();
  phrasesGenerated++;

  setImmediate(loop);
}

app.post("/start", (req, res) => {
  if (!running) {
    running = true;
    loop();
  }
  res.json({ ok: true });
});

app.post("/stop", (req, res) => {
  running = false;
  res.json({ ok: true });
});

app.get("/status", (req, res) => {
  res.json({
    running,
    phrasesGenerated,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Crypto backend running on port ${PORT}`);
});

