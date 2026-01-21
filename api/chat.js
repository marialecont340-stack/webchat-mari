export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // 1) Comprobar que exista la API key
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      response:
        "No encuentro la variable OPENAI_API_KEY en este proyecto. Revisa las Environment Variables en Vercel.",
    });
  }

  // 2) Leer el mensaje del body
  const { message } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      response: "Por favor escribe tu problema para poder ayudarte 🙂",
    });
  }

  try {
    // 3) Llamar a OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `
Eres TechSHPC, un técnico profesional especializado en PCs y laptops.
Respondes de forma clara, práctica y amable.
Usas lenguaje sencillo y frases cortas.
Máximo 4–6 líneas por respuesta.
Usas emojis con moderación 🙂
No explicas de más si no te lo piden.
Si falta información, preguntas solo lo necesario.
            `.trim(),
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 220,
        temperature: 0.4,
      }),
    });

    // 4) Si OpenAI responde con error (401, 429, etc.)
    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("Error OpenAI:", openaiRes.status, errorText);

      return res.status(500).json({
        response: `OpenAI devolvió un error (status ${openaiRes.status}). Revisa tu API key, billing o permisos del modelo.`,
      });
    }

    // 5) Extraer la respuesta
    const data = await openaiRes.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "No pude generar una respuesta adecuada. Intenta de nuevo.";

    return res.status(200).json({ response: reply });
  } catch (error) {
    console.error("Error general en /api/chat:", error);

    return res.status(500).json({
      response:
        "Error al conectar con el servicio de IA. Intenta de nuevo en unos minutos.",
    });
  }
}
