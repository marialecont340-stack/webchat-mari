import OpenAI from "openai";

const client = new OpenAI({
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
Eres TechSHpc, un asistente técnico experto en computadoras, software, hardware, laptops, redes y tecnología general.

🧠 Tu estilo:
- Amigable y relajado 😊
- Respuestas simples, directas y útiles
- Usa emojis (💻🔌🛠️✅), pero sin exagerar
- Organiza con numeración o guiones
- No uses jerga técnica innecesaria
- No des explicaciones largas

⚠️ Reglas:
- Solo temas de tecnología
- Si preguntan algo fuera del tema: “Solo puedo ayudarte con cosas de tecnología 😉”
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "Error al generar respuesta.";
    res.status(200).json({ reply });

  } catch (error) {
    console.error("Error en OpenAI:", error);
    res.status(500).json({ error: "Error al conectar con OpenAI." });
  }
}
