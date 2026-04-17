// FitSuryakant Backend Proxy
// Deploy on Render.com free tier to fix browser CORS issues
//
// DEPLOY STEPS:
// 1. Upload this file + package.json to a GitHub repo
// 2. render.com → New Web Service → connect repo
// 3. Add env variable: ANTHROPIC_API_KEY = sk-ant-xxxx
// 4. Deploy → copy your URL
// 5. Paste URL into FitSuryakant.jsx line 6

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type"] }));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/", function(req, res) {
  res.json({ status: "FitSuryakant backend is running!" });
});

// Proxy — frontend sends here, we forward to Anthropic with secret key
app.post("/api/chat", async function(req, res) {
  try {
    var apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY not set in Render env variables" });
    }
    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(req.body)
    });
    var data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("API error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

var PORT = process.env.PORT || 3001;
app.listen(PORT, function() {
  console.log("Server running on port " + PORT);
});