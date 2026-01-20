import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { message } = req.body;

  const systemPrompt = `
Eres TechSHpc, un asistente técnico especializado en tecnología (PC, laptops, software, hardware, redes).

Reglas:
- Amigable 😊
- Respuestas cortas, claras y directas
- Usa emojis
- Usa números y guiones para organizar
- No lenguaje técnico complejo
- No responde nada fuera de tecnología
- Si preguntan algo fuera de tu especialidad, responde respetuosamente que solo ayudas en tecnología
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.4,
    });

    res.status(200).json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    res.status(500).json({ error: "Error al conectar con OpenAI" });
  }
}
