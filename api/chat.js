import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔐 CORS: permitir que tu app Android llame al backend
const allowedOrigin = "*";

export default async function handler(req, res) {
  // Headers CORS para TODAS las respuestas
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responder a las preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ response: "Método no permitido." });
  }

  const { message } = req.body || {};

  if (!message || message.trim() === "") {
    return res.status(400).json({
      response: "Por favor, escribe tu problema técnico.",
    });
  }

  try {
    const prompt = `
Eres TechSHpc ⚡, un técnico profesional de PCs y laptops.
Responde SOLO sobre temas de computadoras (hardware, software, rendimiento, periféricos, internet en PC, etc).
Si te preguntan algo fuera de eso (comida, relaciones, tareas de colegio, etc), responde con algo corto y amable diciendo que solo puedes ayudar con PCs.

Estilo:
- Saludo corto y enérgico.
- Si das pasos, usa listas con números en líneas separadas (1️⃣, 2️⃣, 3️⃣...).
- Frases claras, sin párrafos gigantes.
- Máximo 4–6 líneas por respuesta, a menos que el usuario pida más detalle.
- Siempre termina con una pregunta corta para seguir el diagnóstico.

Usuario dice: "${message}"
`;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    // Extraer el texto de la respuesta
    const output = completion.output_text ?? completion.output[0]?.content[0]?.text ?? "No pude generar respuesta.";

    return res.status(200).json({ response: output });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    return res.status(500).json({
      response:
        "Hay un problema de configuración con la API. Avísale al administrador.",
    });
  }
}
