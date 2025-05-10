import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

interface MentalHealthResponse {
  estado: 'verde' | 'amarillo' | 'rojo';
  puntaje: number;
  observaciones: string;
  recomendaciones: string[];
}

/**
 * Analyzes user responses to mental health questions using GPT model
 * 
 * @param preguntas Array of questions with their weights
 * @param respuestas User responses to each question (1-5 scale)
 * @returns Mental health assessment with traffic light status
 */
export const analizarRespuestas = async (
  preguntas: { id: number; texto: string; peso: number }[],
  respuestas: { pregunta_id: number; respuesta: number }[]
): Promise<MentalHealthResponse> => {
  try {
    // Format the data for the AI model
    const preguntasRespuestas = respuestas.map(resp => {
      const pregunta = preguntas.find(p => p.id === resp.pregunta_id);
      return {
        pregunta: pregunta?.texto || 'Pregunta no encontrada',
        peso: pregunta?.peso || 1,
        respuesta: resp.respuesta
      };
    });
    
    // Calculate a raw score for fallback
    let rawScore = 0;
    preguntasRespuestas.forEach(item => {
      rawScore += (item.respuesta * item.peso);
    });
    
    // Set fallback state based on raw score
    let fallbackState: 'verde' | 'amarillo' | 'rojo' = 'verde';
    if (rawScore > 40) {
      fallbackState = 'rojo';
    } else if (rawScore > 25) {
      fallbackState = 'amarillo';
    }
    
    // Create prompt for OpenAI
    const prompt = `
    Actúa como un psicólogo experto analizando los resultados de una evaluación de salud mental.
    
    El usuario ha respondido a las siguientes preguntas (escala 1-5, donde 5 es más grave):
    
    ${preguntasRespuestas.map(pr => 
      `- Pregunta: "${pr.pregunta}" (Peso: ${pr.peso})
       - Respuesta: ${pr.respuesta}/5`
    ).join('\n\n')}
    
    Basado en estas respuestas, determina:
    
    1. Un estado de semáforo: "verde" (estado óptimo), "amarillo" (alerta moderada), o "rojo" (alerta grave).
    2. Un puntaje numérico que represente la gravedad de la situación (0-100).
    3. Una observación clínica breve sobre el estado mental del usuario.
    4. Tres recomendaciones prácticas personalizadas según las respuestas.
    
    Responde SOLO en formato JSON estructurado así:
    {
      "estado": "verde/amarillo/rojo",
      "puntaje": 0-100,
      "observaciones": "tu análisis clínico breve",
      "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"]
    }
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Eres un psicólogo experto especializado en evaluaciones de salud mental.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    const responseContent = response.choices[0]?.message?.content || '';
    
    try {
      // Parse the AI response
      const parsedResponse: MentalHealthResponse = JSON.parse(responseContent);
      return parsedResponse;
    } catch (parseError) {
      // Fallback if parsing fails
      console.error('Error parsing AI response:', parseError);
      return {
        estado: fallbackState,
        puntaje: rawScore,
        observaciones: 'No se pudo realizar un análisis detallado. Se recomienda consultar con un profesional.',
        recomendaciones: [
          'Mantener rutinas saludables de sueño y alimentación',
          'Practicar actividades que generen bienestar',
          'Consultar con un profesional de la salud mental'
        ]
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // Fallback response
    return {
      estado: 'amarillo',
      puntaje: 50,
      observaciones: 'No se pudo realizar el análisis automatizado. Se recomienda precaución.',
      recomendaciones: [
        'Buscar apoyo en personas de confianza',
        'Mantener hábitos saludables',
        'Considerar consultar con un profesional'
      ]
    };
  }
}; 