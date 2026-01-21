export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      response: "La API no está configurada correctamente.",
    });
  }

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      response: "Por favor escribe tu problema 🙂",
    });
  }

  try {
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
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
Eres TechSHPC, un técnico profesional en PCs y laptops.
Respondes claro, práctico y amable.
Usas lenguaje simple.
Máximo 4–6 líneas.
Emojis con moderación 🙂
              `.trim(),
            },
            { role: "user", content: message },
          ],
          max_tokens: 220,
          temperature: 0.4,
        }),
      }
    );

    const data = await openaiRes.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      "No pude generar una respuesta.";

    return res.status(200).json({ response: reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      response: "Error al conectar con el servicio.",
    });
  }
}
