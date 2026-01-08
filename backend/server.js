const express = require("express");
const multer = require("multer");
const pdfParseLib = require("pdf-parse");
const pdfParse = pdfParseLib.default || pdfParseLib;

require("dotenv").config();


const app = express();
const upload = multer({ storage: multer.memoryStorage() });

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (_, res) => {
  res.send("Resume parser backend running");
});

/* ---------------- PARSE RESUME ---------------- */
app.post("/parse-resume", upload.single("file"), async (req, res) => {
  try {
    console.log("\n--- NEW REQUEST ---");

    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File received:", req.file.originalname);
    console.log("File size:", req.file.size);

    /* ---------- PDF → TEXT ---------- */
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text || "";

    console.log("PDF text length:", text.length);

    if (!text.trim()) {
      throw new Error("Extracted PDF text is empty (scanned PDF?)");
    }

    /* ---------- GROQ CALL ---------- */
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "You are an ATS resume parser. Return ONLY valid JSON."
            },
            {
              role: "user",
              content: `
Extract resume details from the text below.

Return JSON exactly in this format:
{
  "Full_Name": "",
  "First_Name": "",
  "Middle_Name": "",
  "Last_Name": "",
  "email": "",
  "phone": "",
  "LinkedIn": "",
  "GitHub": "",
  "Portfolio": "",
  "College_Name": "",
  "University_Name": "",
  "CGPA": "",
  "Graduation_Year": "",
  "Field_Study": ""
}

Resume text:
${text}
`
            }
          ]
        })
      }
    );

    console.log(" Groq HTTP status:", groqRes.status);

    const groqData = await groqRes.json();
    console.log(" Groq raw response:", groqData);

    const content =
      groqData?.choices?.[0]?.message?.content || "";

    console.log("LLM content:\n", content);

    /* ---------- SAFE JSON EXTRACTION ---------- */
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("LLM did not return JSON");
    }

    const parsedProfile = JSON.parse(jsonMatch[0]);

    console.log("Parsed JSON:", parsedProfile);

    res.json(parsedProfile);

  } catch (err) {
    console.error("BACKEND ERROR:", err.message);
    res.status(500).json({
      error: "Resume parsing failed",
      details: err.message
    });
  }
});

/* ---------------- START SERVER ---------------- */
app.listen(3000, () => {
  console.log("Resume parser backend running on http://localhost:3000");
});
