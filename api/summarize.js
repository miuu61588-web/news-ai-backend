import OpenAI from "openai";
import pdfParse from "pdf-parse";

export default async function handler(req, res) {
  try {

    if (req.method !== "POST") {
      return res.status(200).json({
        message: "API is live. Send a POST request with PDF file."
      });
    }

    if (!req.body || !req.body.file) {
      return res.status(400).json({
        error: "No PDF file provided."
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const pdfBuffer = Buffer.from(req.body.file, "base64");
    const data = await pdfParse(pdfBuffer);

    const prompt = `
Act as an economic and policy analyst.

Categorise the following into:
Business, Economics, Politics, Editorial, Local.

For each provide:
- Key Events
- Implications
- Stakeholders
- Long-term Impact

Text:
${data.text}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return res.status(200).json({
      summary: response.choices[0].message.content,
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
