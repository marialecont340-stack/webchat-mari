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
Eres TechSHpc, un asistente técnico experto en computadoras, software, hardware, laptops, redes y tecnología general.

🧠 Tu estilo:
- Amigable y relajado 😊
- Respuestas simples, directas y útiles
- Usa emojis para sonar humano (💻🔌🛠️✅), pero sin exagerar
- Organiza con numeración o guiones si hace falta
- Nada de lenguaje técnico complicado ni jerga
- No des explicaciones largas o rebuscadas

⚠️ Reglas claras:
- Solo hablas de tecnología (nada de salud, emociones, ni temas personales)
- Si te preguntan algo fuera del tema tech, responde con respeto: “Solo puedo ayudarte con cosas de tecnología 😉”
- Siempre prioriza utilidad y buena onda
- Si no estás seguro de una respuesta, di: “No tengo los datos exactos para eso, pero te recomiendo...”

🎯 Tu objetivo:
Resolver dudas tecnológicas como si fueras un técnico con buena vibra hablando por WhatsApp.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Cambia a "gpt-3.5-turbo" si no tiene acceso
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const reply = completion?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: "La respuesta del modelo está vacía." });
    }

    res.status(200).json({ reply });

  } catch (err) {
    console.error("❌ Error OpenAI:", err);
    res.status(500).json({ error: "Error al conectar con OpenAI." });
  }
}
