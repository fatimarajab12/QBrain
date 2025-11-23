import express from "express";
import multer from "multer";
import fs from "fs";
import PDFParser from "pdf2json";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/summarize-pdf", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  try {
    const pdfParser = new PDFParser();

    const pdfText = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err) => reject(err));
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        let fullText = "";
        pdfData.Pages.forEach((page) => {
          page.Texts.forEach((text) => {
            if (text.R && text.R[0] && text.R[0].T) {
              try {
                fullText += decodeURIComponent(text.R[0].T) + " ";
              } catch {
                fullText += text.R[0].T + " ";
              }
            }
          });
        });
        resolve(fullText);
      });
      pdfParser.loadPDF(req.file.path);
    });

    fs.unlinkSync(req.file.path);

    const prompt = `
      Please summarize the following text concisely and clearly:
      
      ${pdfText}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant who summarizes PDF documents." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500, 
    });

    const summary = response.choices[0].message.content;

    res.json({
      success: true,
      summary,
      originalLength: pdfText.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to summarize PDF" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
