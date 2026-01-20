import OpenAI from "openai";

// Crear instancia de OpenAI con la API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ response: "Método no permitido." });
  }

  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ response: "Por favor, escribe tu problema técnico." });
  }

  try {
    const prompt = `
Eres TechSHpc, un asistente técnico amable y amigable para PC y laptops.
Responde exactamente a lo que el usuario pregunta.
- Usa lenguaje sencillo, nada de jerga técnica.
- Da pasos claros, cortos y fáciles de seguir.
- Sé cordial y útil, no agregues información extra.
Usuario dice: "${message}"
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300 // limita la respuesta para mantenerla concisa
    });

    const responseText = completion.choices?.[0]?.message?.content?.trim() || "No se recibió respuesta del modelo.";

    res.status(200).json({ response: responseText });

  } catch (err) {
    console.error("Error OpenAI:", err?.message || err);
    res.status(500).json({ response: "Error conectando con OpenAI." });
  }
}
