// backend/index.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const OpenAI = require("openai"); // ✅ Correct for v4+
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(require("cors")());

// ✅ Initialize OpenAI client (v4+)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/summarize", async (req, res) => {
  try {
    console.log("inside summary");
    const { url } = req.body;
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const text = $("body").text().replace(/\s+/g, " ").slice(0, 3000); // crude extraction

    // const aiResponse = await openai.chat.completions.create({
    //   model: "gpt-4o",
    //   messages: [{ role: "user", content: `Summarize this:\n${text}` }],
    // });
    //const summary = aiResponse.data.choices[0].message.content;

    const summary = `This article explores the history, definition, and applications of Artificial Intelligence (AI). It discusses how AI has evolved over time, starting from early symbolic systems to modern machine learning techniques. Key applications of AI include natural language processing, robotics, and computer vision. The article also examines ethical considerations and the impact of AI on society, such as job displacement and algorithmic bias.`;
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to summarize");
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
