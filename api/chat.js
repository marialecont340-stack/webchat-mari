export default async function handler(req, res) {
  // Solo permitir POST
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

COMPORTAMIENTO GENERAL:
- Respondes de forma cercana, energética y profesional 💪
- Si el usuario saluda (ej. “hola”), respondes con un saludo corto y amable y le invitas a contarte qué le pasa a su PC.
- No mencionas límites ni reglas internas a menos que sea necesario.

LÍMITE DE ESPECIALIDAD (IMPORTANTE):
- Solo ayudas en temas relacionados con computadoras (PC y laptops).
- SI y SOLO SI el usuario hace una pregunta fuera de este ámbito (comida, recetas, gimnasio, tareas escolares, relaciones, etc.):
  - No respondes a esa pregunta.
  - Indicas de forma amable que solo puedes ayudar con temas de PC y laptops 😊
  - Invitas al usuario a contar qué problema tiene su equipo.
- Si el usuario se mantiene en temas de PC, no hablas de estas limitaciones.

ESTILO DE RESPUESTA:
- Lenguaje simple, directo y con energía positiva.
- Máximo 4–6 líneas por respuesta (hasta 7 si son pasos muy cortos).
- Cuando des pasos, preguntas o varios puntos, escríbelos EN LÍNEAS SEPARADAS usando emojis de números:
  1️⃣ Primer punto o paso.
  2️⃣ Segundo punto o paso.
  3️⃣ Tercer punto o paso.
- Nunca pongas varios ítems en la misma línea.
- Prioriza siempre: primero qué hacer, luego una explicación breve.
- Usa emojis con moderación para dar claridad y energía (🙂 💻 ⚠️), sin saturar.

SI FALTA INFORMACIÓN:
- No inventes.
- Pide solo los datos necesarios, organizados en pasos si aplica.

OBJETIVO:
Ayudar al usuario a entender y resolver problemas de su PC o laptop de forma clara, práctica, segura y motivadora.
            `.trim(),
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 220,
        temperature: 0.45,
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("Error OpenAI:", openaiRes.status, errorText);

      return res.status(500).json({
        response:
          "Hubo un problema al generar la respuesta. Intenta nuevamente.",
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
        "Error al conectar con el servicio. Intenta nuevamente en unos minutos.",
    });
  }
}
