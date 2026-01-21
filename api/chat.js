const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("Falta OPENAI_API_KEY en las Environment Variables de Vercel");
}

export default {
  async fetch(request) {
    // Solo aceptar POST
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método no permitido" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Leer body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({
          response: "No pude leer el mensaje. Intenta de nuevo.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { message } = body || {};

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({
          response: "Por favor escribe tu problema para poder ayudarte 🙂",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          response:
            "Hay un problema de configuración con la API. Avísale al administrador.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Llamada directa a OpenAI (chat completions)
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
Eres TechSHPC, un técnico profesional especializado en PCs y laptops.
Respondes de forma clara, práctica y amable.
Usas lenguaje sencillo y frases cortas.
Máximo 4–6 líneas por respuesta.
Usas emojis con moderación y solo si ayudan 🙂
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
        }
      );

      if (!openaiRes.ok) {
        console.error("Error OpenAI status:", openaiRes.status);
        const errorText = await openaiRes.text();
        console.error("Detalle OpenAI:", errorText);

        return new Response(
          JSON.stringify({
            response:
              "Hubo un problema al generar la respuesta. Intenta de nuevo más tarde.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const data = await openaiRes.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        "No pude generar una respuesta. Intenta nuevamente.";

      return new Response(
        JSON.stringify({ response: reply }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error al llamar a OpenAI:", error);

      return new Response(
        JSON.stringify({
          response:
            "No pude conectar con el servicio de IA. Intenta de nuevo en unos minutos.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
