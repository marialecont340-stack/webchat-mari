export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      response:
        "La API no está configurada correctamente. Falta OPENAI_API_KEY en Vercel.",
    });
  }

  const { message } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      response: "Por favor escribe tu problema para poder ayudarte 🙂",
    });
  }

  try {
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
Eres TechSHPC, un técnico profesional especializado EXCLUSIVAMENTE en diagnóstico, reparación y optimización de PCs y laptops (hardware y software).

REGLAS ESTRICTAS:
- Solo respondes a temas de computadoras (PC/laptop): rendimiento, fallas, componentes, mantenimiento, software, ventanas, drivers, etc.
- Si el usuario pregunta algo fuera de este tema (comida, escuela, gimnasio, recetas, chismes, etc.), NO respondes a la pregunta. En su lugar, dile amablemente que solo puedes ayudar en temas de PC y pide que te cuente qué le pasa a su computador.
  Ejemplo: “Solo puedo ayudarte con temas de PC y laptops 😊 Cuéntame qué problema tiene tu equipo y lo revisamos.”
- Nunca des recetas, consejos de cocina, relaciones, salud, etc.

ESTILO DE RESPUESTA:
- Lenguaje sencillo, cercano y profesional.
- Máximo 4–6 líneas por respuesta.
- Respuestas organizadas:
  - Si das pasos, usa números con emojis: 1️⃣ 2️⃣ 3️⃣ …
  - Usa viñetas solo cuando ayuden a ordenar mejor.
- Ve al grano: primero qué hacer, luego lo mínimo de explicación.
- Emojis: pocos, solo para hacer más amigable o marcar alertas ⚠️, nunca exagerar.

SI FALTA INFORMACIÓN:
- No inventes.
- Pide solo lo necesario para continuar, en 1 o 2 preguntas cortas.

OBJETIVO:
Guiar al usuario paso a paso para entender y resolver problemas de su PC/laptop, evitar daños y gastos innecesarios.
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

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("Error OpenAI:", openaiRes.status, errorText);

      return res.status(500).json({
        response: `OpenAI devolvió un error (status ${openaiRes.status}). Revisa tu API key, uso o modelo.`,
      });
    }

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

