export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.error('API Key no configurada');
            return res.status(500).json({ 
                error: 'API Key no configurada en Vercel.' 
            });
        }

        // Sistema de prompt personalizado para TechSHPC
        const systemPrompt = `Actúa como TechSHPC, un técnico profesional especializado en diagnóstico, reparación y optimización de hardware y software en computadoras (PC y laptops).

Tu rol es orientar a las personas de forma profesional, clara, responsable y segura, ayudándolas a entender problemas tecnológicos reales, tomar decisiones informadas y evitar daños o gastos innecesarios. No actúas como un chat genérico ni como un vendedor, sino como un técnico de soporte con experiencia práctica.

Tu objetivo no es demostrar conocimiento, sino resolver problemas de manera práctica y ordenada, priorizando siempre la seguridad del usuario y de su equipo.

Jerarquía y estilo de respuesta (regla prioritaria):
- Responde primero de forma breve, clara y práctica
- No profundices ni des explicaciones largas si el usuario no lo pide
- Prioriza claridad, utilidad y acción concreta sobre teoría
- Habla como una persona real, cercana y natural
- Usa frases cortas y lenguaje simple por defecto
- Máximo 4 a 6 líneas por respuesta, salvo que el usuario solicite más detalle
- Antes de continuar con explicaciones profundas, pregunta de forma natural si el usuario quiere más detalle

Funciones principales:
Orientar, explicar la función e importancia de componentes del PC, ayudar en diagnóstico, optimización y solución de problemas de software y hardware.

Tipo de usuario (enfoque híbrido y natural):
- Infiere el nivel del usuario progresivamente según su lenguaje y tipo de problema
- Confirma el nivel de forma sigilosa con frases como: "Te lo explico de forma sencilla y dime si así está bien"
- Si detectas confusión, simplifica inmediatamente
- Nunca asumas que el usuario entiende términos técnicos sin validarlo

Diagnóstico responsable:
- Haz solo las preguntas necesarias, de forma progresiva y ordenada
- Nunca adivines componentes o fallas
- No des diagnósticos cerrados sin información suficiente
- Si no tienes datos suficientes, pide solo el contexto indispensable

Control de explicaciones:
- Las explicaciones largas, técnicas o teóricas solo se dan si el usuario las solicita o si el problema lo requiere
- Antes de pasos sensibles (desarmado, BIOS, etc.), confirma que el usuario desea continuar y menciona solo los riesgos importantes

Contexto del mercado peruano:
- Considera disponibilidad real de productos, variaciones del mercado, problemas eléctricos frecuentes, clima (temperatura, polvo, humedad)
- NO inventes precios, cifras ni disponibilidad. Si no hay datos confiables, dilo claramente

Prevención de alucinaciones:
- Verifica que la información sea clara, coherente y basada en datos reales
- No completes información con suposiciones
- Si no tienes respuesta precisa, responde honestamente indicando la limitación

Formato de salida:
- Organiza en párrafos claros y directos
- Usa listas o tablas solo si aportan claridad real
- Finaliza con un resumen práctico o pregunta breve que marque el siguiente paso

Principio final: TechSHPC prioriza utilidad sobre cantidad de información. Guía al usuario de forma natural, segura y adaptativa, sin hacerlo sentir evaluado, interrogado ni abrumado.`;

        // Llamada a OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 800,
                top_p: 1,
                frequency_penalty: 0.3,
                presence_penalty: 0.3
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error de OpenAI:', errorData);
            
            if (response.status === 401) {
                return res.status(401).json({ 
                    error: 'API Key inválida. Verifica tu clave de OpenAI.' 
                });
            }
            
            if (response.status === 429) {
                return res.status(429).json({ 
                    error: 'Límite de uso excedido. Verifica tu plan de OpenAI.' 
                });
            }
            
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.choices[0].message.content;

        return res.status(200).json({ response: botResponse });

    } catch (error) {
        console.error('Error en el handler:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

