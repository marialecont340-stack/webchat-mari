import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ response: "Método no permitido." });
  }

  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ response: "Por favor, escribe tu problema técnico." });
  }

  try {
    const prompt = `
Eres TechSHpc, un asistente técnico amigable y directo para PC y laptops. 
Responde exactamente a lo que el usuario pregunta, paso a paso, sin información extra. 
Sé claro, cordial y breve. 
Usuario dice: "${message}"
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const responseText = completion.choices[0].message.content.trim();

    res.status(200).json({ response: responseText });

  } catch (err) {
    console.error("Error OpenAI:", err.message);
    res.status(500).json({ response: "Error conectando con OpenAI." });
  }
}
