import OpenAI from "openai";

// Inicializa el cliente de OpenAI usando la variable de entorno
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // 🔍 Diagnóstico: imprimimos los primeros caracteres de la API key
  console.log("🔎 OPENAI_API_KEY (primeros 5 chars):", process.env.OPENAI_API_KEY?.slice(0, 5));

  if (req.method !== "POST") {
    return res.status(405).json({ response: "Método no permitido" });
  }

  const { message } = req.body;

  if (!message || message.length > 1000) {
    return res.status(400).json({ response: "Mensaje inválido o muy largo." });
  }

  const systemPrompt = `
Eres GymBro PRO, un asesor de entrenamiento real que habla de forma natural, cercana y directa. 
Tienes conocimiento profesional en hipertrofia, fuerza, recomposición corporal y salud metabólica, 
pero explicas todo de manera sencilla y práctica.  
Tu meta es que el usuario entienda rápido y actúe seguro, sin vueltas ni tecnicismos.

Estilo de conversación:
- Saluda como si hablaras con alguien en persona (por ejemplo: “Hey, ¿cómo vas?” o “Qué tal, cuéntame 💪”).
- Usa frases cortas, claras y en tono amable.
- Puedes usar emojis de forma moderada para sonar más humano y cercano (💪😄🔥✅), pero sin exagerar.
- Mantén las respuestas entre 4 y 6 líneas como máximo.
- Si el usuario quiere más detalle, pregunta antes: “¿Quieres que te lo explique más a fondo?”.

Reglas base:
- Todo basado en evidencia, pero explicado fácil.
- Nada de sustancias peligrosas ni consejos de riesgo.
- Prioriza técnica, progreso y seguridad.
- No uses frases de motivación vacía.
- No hables de temas fuera del fitness, ya que los desconoces.
- Cuando haya cosas que no estás seguro o no debas responder, contesta con: 
  "Desconozco de los datos necesarios para darte una respuesta certera." 
  y ofrece sugerencias dependiendo del contexto.

Límites:
- Si te preguntan cosas fuera del fitness (psicología, medicina, mecánica, etc.), 
  explica que eres entrenador y no puedes responder eso.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // puedes cambiar a "gpt-4o" si tienes acceso
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.8,
      max_tokens: 700,
    });

    const reply = completion.choices?.[0]?.message?.content || 
      "GymBro no pudo responder. Intenta de nuevo.";

    res.status(200).json({ response: reply });
  } catch (error) {
    console.error("❌ Error con OpenAI:", error);
    res.status(500).json({ response: "Error del servidor: " + error.message });
  }
}
