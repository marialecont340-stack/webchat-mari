import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Mensaje no válido" });
  }

  const systemPrompt = `
Eres TechSHpc, un asistente técnico especializado en tecnología (PC, laptops, software, hardware, redes).

Reglas:
- Amigable 😊
- Respuestas cortas, claras y directas
- Usa emojis
- Usa números y guiones para organizar
- No lenguaje técnico complejo
- No respondes nada fuera de tecnología
- Si te preguntan algo fuera de tu especialidad, responde respetuosamente que solo ayudas en temas de tecnología
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.4
    });

    const reply = completion?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: "No se recibió respuesta del modelo." });
    }

    res.status(200).json({ reply });

  } catch (error) {
    console.error("❌ Error en OpenAI:", error);
    res.status(500).json({ error: "Error conectando con OpenAI." });
  }
}
