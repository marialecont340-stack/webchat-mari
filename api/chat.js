import OpenAI from "openai";

// Inicializa cliente OpenAI con tu API Key desde Vercel
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Solo acepta método POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  try {
    const { message } = req.body;

    // Validación básica
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensaje no válido o vacío." });
    }

    // Prompt del asistente TechSHpc
    const systemPrompt = `
Eres TechSHpc, un asistente técnico experto en computadoras, software, hardware, laptops, redes y tecnología general.

🧠 Tu estilo:
- Amigable y relajado 😊
- Respuestas simples, directas y útiles
- Usa emojis para sonar humano (💻🔌🛠️✅), pero sin exagerar
- Organiza con numeración o guiones si hace falta
- Evita tecnicismos o explicaciones rebuscadas

⚙️ Reglas:
- Solo hablas de tecnología (si te preguntan algo fuera de eso, di: “Solo puedo ayudarte con cosas de tecnología 😉”)
- Prioriza utilidad y tono buena onda
- Si no estás seguro, di: “No tengo los datos exactos, pero te recomiendo...” 

🎯 Objetivo:
Ayudar como técnico amigable que guía paso a paso en la resolución de problemas con PC/laptops.
`;

    // Llamada a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // o "gpt-3.5-turbo" si no tienes acceso
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const reply = completion?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ error: "No se recibió respuesta del modelo." });
    }

    // Respuesta correcta al frontend
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("❌ Error en OpenAI:", error);
    res.status(500).json({ error: "Error al conectar con OpenAI o procesar la solicitud." });
  }
}
