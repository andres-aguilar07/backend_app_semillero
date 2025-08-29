import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:0.5b'; // Modelo más liviano disponible

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface MentalHealthResponse {
  estado: 'verde' | 'amarillo' | 'rojo';
  puntaje: number;
  observaciones: string;
  recomendaciones: string[];
}

interface ChatResponse {
  respuesta: string;
  timestamp: string;
}

/**
 * Verifica si Ollama está disponible y el modelo está cargado
 */
export const checkOllamaHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`);
    if (!response.ok) return false;
    
    const data = await response.json();
    const models = data.models || [];
    return models.some((model: any) => model.name.includes(OLLAMA_MODEL.split(':')[0]));
  } catch (error) {
    console.error('Error checking Ollama health:', error);
    return false;
  }
};

/**
 * Descarga el modelo si no está disponible
 */
export const downloadModel = async (): Promise<boolean> => {
  try {
    console.log(`Descargando modelo ${OLLAMA_MODEL}...`);
    const response = await fetch(`${OLLAMA_API_URL}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: OLLAMA_MODEL }),
    });

    if (!response.ok) {
      throw new Error(`Error descargando modelo: ${response.statusText}`);
    }

    // Leer la respuesta de streaming
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No se pudo leer la respuesta');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.status) {
            console.log(`Estado: ${data.status}`);
          }
        } catch (e) {
          // Ignorar líneas que no son JSON válido
        }
      }
    }

    console.log(`Modelo ${OLLAMA_MODEL} descargado exitosamente`);
    return true;
  } catch (error) {
    console.error('Error descargando modelo:', error);
    return false;
  }
};

/**
 * Envía una consulta a Ollama y obtiene la respuesta
 */
export const queryOllama = async (prompt: string, systemPrompt?: string): Promise<string> => {
  try {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          top_k: 40,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en Ollama API: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || 'No se pudo generar respuesta';
  } catch (error) {
    console.error('Error consultando Ollama:', error);
    throw error;
  }
};

/**
 * Analiza respuestas de salud mental usando Ollama
 */
export const analizarRespuestasOllama = async (
  preguntas: { id: number; texto: string; peso: number }[],
  respuestas: { pregunta_id: number; respuesta: number }[]
): Promise<MentalHealthResponse> => {
  try {
    // Formatear datos para el modelo
    const preguntasRespuestas = respuestas.map(resp => {
      const pregunta = preguntas.find(p => p.id === resp.pregunta_id);
      return {
        pregunta: pregunta?.texto || 'Pregunta no encontrada',
        peso: pregunta?.peso || 1,
        respuesta: resp.respuesta
      };
    });
    
    // Calcular puntaje base para fallback
    let rawScore = 0;
    preguntasRespuestas.forEach(item => {
      rawScore += (item.respuesta * item.peso);
    });
    
    // Estado fallback basado en puntaje
    let fallbackState: 'verde' | 'amarillo' | 'rojo' = 'verde';
    if (rawScore > 40) {
      fallbackState = 'rojo';
    } else if (rawScore > 25) {
      fallbackState = 'amarillo';
    }

    const systemPrompt = `Eres un psicólogo experto especializado en evaluaciones de salud mental. Debes responder ÚNICAMENTE en formato JSON válido.`;

    const prompt = `
    Analiza las siguientes respuestas de una evaluación de salud mental (escala 1-5, donde 5 es más grave):
    
    ${preguntasRespuestas.map(pr => 
      `- Pregunta: "${pr.pregunta}" (Peso: ${pr.peso})
       - Respuesta: ${pr.respuesta}/5`
    ).join('\n\n')}
    
    Determina:
    1. Un estado de semáforo: "verde" (estado óptimo), "amarillo" (alerta moderada), o "rojo" (alerta grave)
    2. Un puntaje numérico (0-100) que represente la gravedad
    3. Una observación clínica breve sobre el estado mental
    4. Tres recomendaciones prácticas personalizadas
    
    Responde SOLO en este formato JSON:
    {
      "estado": "verde/amarillo/rojo",
      "puntaje": 0-100,
      "observaciones": "tu análisis clínico breve",
      "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"]
    }`;

    const response = await queryOllama(prompt, systemPrompt);
    
    try {
      // Intentar parsear la respuesta JSON
      const cleanResponse = response.replace(/```json|```/g, '').trim();
      const parsedResponse: MentalHealthResponse = JSON.parse(cleanResponse);
      
      // Validar que tenga los campos requeridos
      if (!parsedResponse.estado || !parsedResponse.puntaje || !parsedResponse.observaciones || !parsedResponse.recomendaciones) {
        throw new Error('Respuesta incompleta del modelo');
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error('Error parseando respuesta de Ollama:', parseError);
      
      // Fallback con datos calculados
      return {
        estado: fallbackState,
        puntaje: Math.min(rawScore * 2, 100),
        observaciones: `Evaluación basada en ${respuestas.length} respuestas. Puntaje calculado: ${rawScore}`,
        recomendaciones: [
          'Mantén rutinas saludables de sueño y ejercicio',
          'Busca apoyo en familiares y amigos cercanos',
          'Considera hablar con un profesional si persisten las molestias'
        ]
      };
    }
  } catch (error) {
    console.error('Error en análisis con Ollama:', error);
    
    // Fallback completo
    const rawScore = respuestas.reduce((sum, resp) => {
      const pregunta = preguntas.find(p => p.id === resp.pregunta_id);
      return sum + (resp.respuesta * (pregunta?.peso || 1));
    }, 0);
    
    return {
      estado: rawScore > 40 ? 'rojo' : rawScore > 25 ? 'amarillo' : 'verde',
      puntaje: Math.min(rawScore * 2, 100),
      observaciones: 'Evaluación realizada con sistema de respaldo debido a error en el análisis avanzado',
      recomendaciones: [
        'Mantén rutinas saludables de sueño y ejercicio',
        'Busca apoyo en familiares y amigos cercanos',
        'Considera hablar con un profesional si persisten las molestias'
      ]
    };
  }
};

/**
 * Chat general con IA usando Ollama
 */
export const chatWithOllama = async (mensaje: string, contexto?: string): Promise<ChatResponse> => {
  try {
    const systemPrompt = `Eres un asistente de salud mental empático y profesional. Proporciona respuestas útiles, comprensivas y apropiadas. Mantén un tono cálido pero profesional. Si detectas signos de crisis, recomienda buscar ayuda profesional inmediatamente.`;
    
    let prompt = mensaje;
    if (contexto) {
      prompt = `Contexto: ${contexto}\n\nPregunta: ${mensaje}`;
    }

    const respuesta = await queryOllama(prompt, systemPrompt);
    
    return {
      respuesta,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en chat con Ollama:', error);
    
    return {
      respuesta: 'Lo siento, no pude procesar tu mensaje en este momento. Por favor, intenta nuevamente.',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Inicializa Ollama - descarga el modelo si no está disponible
 */
export const initializeOllama = async (): Promise<boolean> => {
  try {
    console.log('Inicializando Ollama...');
    
    // Verificar si Ollama está disponible
    const isHealthy = await checkOllamaHealth();
    
    if (!isHealthy) {
      console.log('Modelo no encontrado, descargando...');
      const downloaded = await downloadModel();
      
      if (!downloaded) {
        console.error('No se pudo descargar el modelo');
        return false;
      }
    }
    
    console.log('Ollama inicializado correctamente');
    return true;
  } catch (error) {
    console.error('Error inicializando Ollama:', error);
    return false;
  }
};
