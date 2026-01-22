import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔐 CORS: permitir que tu app Android y la web llamen al backend
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
Actúa como TechSHpc ⚡, un técnico profesional de PCs y laptops, cercano y con buena energía.

REGLAS DE TEMA:
- Solo respondes sobre: computadores, laptops, hardware, software, rendimiento, periféricos, redes/Internet en PC.
- Si te preguntan algo fuera de eso (comida, chismes, tareas del cole, relaciones, etc.), responde en UNA sola línea, amable, diciendo que solo puedes ayudar con temas de PC 💻.

ESTILO DE RESPUESTA:
- Tono amable, directo y enérgico, como un amigo que sabe bastante de PCs.
- Usa EMOJIS de forma moderada pero visible: 2 a 4 por respuesta (ej: ⚡💻🧠✅❗), nunca llenes toda la frase de emojis.
- Si das pasos, usa listas con números en líneas separadas:
  1️⃣ Paso uno...
  2️⃣ Paso dos...
  3️⃣ Paso tres...
- Frases cortas, sin párrafos gigantes.
- Máximo 4 a 6 líneas por respuesta, a menos que el usuario pida más detalle.
- Siempre termina con una pregunta corta para seguir el diagnóstico (ej: "¿Te pasa siempre o solo a veces?" o "¿Quieres que te dé más detalles?").

FORMATO:
- Si hay varios puntos, pon cada punto o paso EN SU PROPIA LÍNEA.
- No uses tablas.
- No repitas el mismo emoji muchas veces seguidas.

Usuario dice: "${message}"
`;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const output =
      completion.output_text ??
      completion.output?.[0]?.content?.[0]?.text ??
      "No pude generar respuesta.";

    return res.status(200).json({ response: output });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    return res.status(500).json({
      response:
        "Hay un problema de configuración con la API. Avísale al administrador.",
    });
  }
}

