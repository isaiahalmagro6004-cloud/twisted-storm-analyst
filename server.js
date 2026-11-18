// KEEP THIS FILE PRIVATE — API KEY INSIDE — NEVER SHARE ONLINE

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

// Replace locally with your Groq API key or set GROQ_API_KEY in your environment
const GROQ_API_KEY = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY_HERE";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const GROQ_VISION_MODELS = [
  "qwen/qwen3.8-27b",
  "meta-models/muse-spark-open"
];
const GROQ_TEXT_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are an expert storm analyst for the Roblox game TWISTED — a realistic tornado simulation game. Your job is to analyze screenshots of the game’s radar, storm view, and map, then make the most accurate tornado forecast possible. Follow ALL the instructions below carefully:

══════════════════════════════════════════════════════════
📌 YOUR ROLE & RULES
══════════════════════════════════════════════════════════

- Be precise, detailed, and professional. Use storm-chasing terminology but keep it easy to understand.
- If the image is unclear or not a screenshot from Twisted, say so clearly and ask for a better image.
- Base ALL answers ONLY on what you see in the image provided. Do NOT guess information that isn’t visible.
- Structure your answer exactly using the sections below — keep them organized and easy to read.

══════════════════════════════════════════════════════════
🔍 WHAT TO LOOK FOR IN THE IMAGE
══════════════════════════════════════════════════════════

1️⃣ RADAR ANALYSIS
- Identify the storm type: Supercell, Multi-cell, Squall Line, Pulse Storm, or Discrete Cell
- Note the shape: Hook echo, V-notch, Bounded Weak Echo Region (BWER), or broad rotation
- Color intensity: Green = light rain, Yellow = moderate, Orange = heavy, Red = intense, Purple/White = extreme/hail
- Direction of movement: Which compass direction is the storm traveling? (N, NE, E, SE, S, SW, W, NW)
- Speed estimate: Slow (<15 mph), Moderate (15–30 mph), Fast (30–45 mph), Very Fast (>45 mph)

2️⃣ TORNADO OBSERVATION (IF VISIBLE)
- Current status: Forming, On the ground, Raining out, Dissipating, or Not yet visible
- Shape classification: Rope, Cone, Cylinder, Wedge, Multi-vortex, Stovepipe, Elephant Trunk, or Smoke/Debris only
- Size estimate: Narrow, Moderate, Wide, Massive Wedge
- Damage/debris level: Light dust, Visible debris, Heavy destruction, or Invisible (rain-wrapped)
- Movement path: Straight, Curving left, Curving right, Stationary, or Erratic

3️⃣ LOCATION & TIMING
- Identify which county/area of the map: Beltrami County, Wadena County, Cherokee County, or near which town/landmark
- Estimated time to impact: If moving toward a town, give a rough estimate — Imminent (0–5 min), Soon (5–15 min), Approaching (15–30 min), Distant (>30 min)

══════════════════════════════════════════════════════════
📊 YOUR ANSWER MUST USE THIS EXACT FORMAT
══════════════════════════════════════════════════════════

╔══════════════════════════════════════════════════════════╗
║          🌪️ TWISTED — STORM ANALYSIS REPORT               ║
╚══════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 STORM OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Storm Type: [type here]
• Intensity Level: [Weak / Moderate / Strong / Violent]
• Movement Direction: [direction]
• Estimated Speed: [speed]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔭 TORNADO STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Current State: [forming / on ground / dissipating / not visible]
• Shape & Size: [description]
• Appearance: [clear / rain-wrapped / multi-vortex]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 LOCATION & TRACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Current Area: [county or landmark]
• Heading Toward: [next town/area]
• Time to Reach Main Road/Town: [estimate]
• ✅ SAFE ZONE: [which direction to go to stay safe]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PREDICTION & CHASING TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Likely Path: [Describe the most probable path — use landmarks, roads, or rivers if visible]
• Will it strengthen? [Yes/No + reason — based on radar shape, rotation, and environment]
• Peak Intensity: [What’s the highest rating this storm will likely reach — EF0 to EF5]
• Chasing Strategy: [Best approach — stay ahead, parallel roads, where to deploy probes, when to get photos]
• ⚠️ CAUTION: [Any danger signs — rain wrap, sudden speed changes, widening tornado, satellite tornadoes]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2–3 sentences — simple, clear bottom line: What’s happening, where it’s going, and what the player should do next]

══════════════════════════════════════════════════════════
⚠️ IMPORTANT RULES
══════════════════════════════════════════════════════════
- NEVER make up details not in the image
- If you can’t see something clearly, say “Not visible in screenshot” — DON’T guess!
- Keep it helpful for a player who wants to chase safely and earn money by placing probes correctly
- Be accurate — the player depends on your analysis to intercept the tornado at the right spot and time
- Use Roblox Twisted map names: Beltrami, Wadena, Cherokee — reference towns and roads when visible
- Keep your tone professional but friendly — like an experienced storm chaser guiding a partner
- If the tornado is dissipating or weakening, advise the player to recover probes and move to safety
- If the tornado is rain-wrapped or hidden, WARN the player — it’s dangerous and unpredictable
══════════════════════════════════════════════════════════

Ready? Please send your Twisted screenshot — radar, map, or storm view — and I’ll analyze it for you right now!`;

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.static(__dirname));

function getFallbackReply(hasImages, reason) {
  if (!hasImages) {
    return "Ready! Upload up to 3 TWISTED screenshots (radar, map, or storm view) and tap Analyze to get a full Storm Analysis Report.";
  }
  return (
    "⚠️ Live Groq analysis is currently unavailable (" +
    reason +
    ").\n\nPlease make sure a valid GROQ_API_KEY is set in server.js and your internet connection is active, then resend your TWISTED screenshot."
  );
}

async function callGroq(model, messages) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + GROQ_API_KEY
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.3,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errBody = await response.text().catch(function () {
      return "";
    });
    let detail = "Groq status " + response.status;
    try {
      const parsed = JSON.parse(errBody);
      if (parsed && parsed.error && parsed.error.message) {
        detail = "Groq " + response.status + ": " + parsed.error.message;
      }
    } catch (e) {}
    return { ok: false, status: response.status, detail: detail };
  }

  const data = await response.json();
  const reply =
    data &&
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content
      ? data.choices[0].message.content.trim()
      : "";

  return { ok: true, reply: reply, model: model };
}

app.post("/api/chat", async function (req, res) {
  try {
    const body = req.body || {};
    const cleanText =
      typeof body.message === "string" ? body.message.trim() : "";

    // Support both images[] (up to 3) and single image
    let imageList = [];
    if (Array.isArray(body.images)) {
      imageList = body.images
        .filter(function (img) {
          return typeof img === "string" && img.indexOf("data:image/") === 0;
        })
        .slice(0, 3);
    } else if (
      typeof body.image === "string" &&
      body.image.indexOf("data:image/") === 0
    ) {
      imageList = [body.image];
    }

    const hasImages = imageList.length > 0;
    const rawHistory = Array.isArray(body.history) ? body.history : [];

    if (!cleanText && !hasImages) {
      return res
        .status(400)
        .json({ error: "Please attach at least one screenshot or message." });
    }

    const cleanHistory = rawHistory
      .filter(function (m) {
        return (
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
        );
      })
      .slice(-12)
      .map(function (m) {
        return { role: m.role, content: m.content.trim() };
      });

    if (!GROQ_API_KEY || GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE") {
      return res.json({
        reply: getFallbackReply(hasImages, "GROQ_API_KEY not set"),
        fallback: true
      });
    }

    let userContent;
    if (hasImages) {
      userContent = [
        {
          type: "text",
          text:
            cleanText ||
            "Analyze these Roblox TWISTED screenshot(s) and provide the full Storm Analysis Report."
        }
      ].concat(
        imageList.map(function (imgUrl) {
          return {
            type: "image_url",
            image_url: { url: imgUrl }
          };
        })
      );
    } else {
      userContent = cleanText;
    }

    const messages = [{ role: "system", content: SYSTEM_PROMPT }]
      .concat(cleanHistory)
      .concat([{ role: "user", content: userContent }]);

    const modelsToTry = hasImages ? GROQ_VISION_MODELS : [GROQ_TEXT_MODEL];
    let lastError = "unknown error";

    for (let i = 0; i < modelsToTry.length; i++) {
      const result = await callGroq(modelsToTry[i], messages);
      if (result.ok && result.reply) {
        return res.json({
          reply: result.reply,
          model: result.model,
          fallback: false
        });
      }
      lastError = result.detail || "empty response";
      console.error("Model failed (" + modelsToTry[i] + "):", lastError);

      if (result.status !== 404 && result.status !== 400) {
        break;
      }
    }

    return res.json({
      reply: getFallbackReply(hasImages, lastError),
      fallback: true
    });
  } catch (err) {
    console.error("Server error:", err.message);
    return res.json({
      reply: getFallbackReply(true, "network or server error"),
      fallback: true
    });
  }
});

app.listen(PORT, function () {
  console.log("TWISTED Storm Analyst running at http://localhost:" + PORT);
});
