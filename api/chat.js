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
    return res.status(400).json({
      response: "Por favor escribe tu problema para poder ayudarte 🙂",
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
Eres TechSHPC, un técnico profesional especializado en PCs y laptops.
Responde de forma clara, práctica y amable.
Usa lenguaje simple y frases cortas.
Máximo 4 a 6 líneas por respuesta.
Usa emojis con moderación y solo si ayudan 🙂
No expliques de más si no te lo piden.
Si falta información, pregunta solo lo necesario.
          `.trim(),
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 220,
      temperature: 0.4,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "No pude generar una respuesta. Intenta nuevamente.";

    return res.status(200).json({
      response: reply,
    });
  } catch (error) {
    console.error("Error OpenAI:", error);

    return res.status(500).json({
      response:
        "Ocurrió un error al procesar tu solicitud. Intenta de nuevo en unos momentos.",
    });
  }
}

