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
    
    // Algoritmo avanzado de semáforo para evitar filtraciones
    let rawScore = 0;
    let respuestasAltas = 0; // Contador de respuestas 4-5
    let respuestasBajas = 0; // Contador de respuestas 1-2
    const totalPreguntas = preguntasRespuestas.length;
    
    preguntasRespuestas.forEach(item => {
      const puntajePonderado = item.respuesta * item.peso;
      rawScore += puntajePonderado;
      
      if (item.respuesta >= 4) respuestasAltas++;
      if (item.respuesta <= 2) respuestasBajas++;
    });
    
    const porcentajeAltas = (respuestasAltas / totalPreguntas) * 100;
    const puntajePromedio = rawScore / totalPreguntas;
    
    // Criterios más estrictos para evitar filtraciones
    let fallbackState: 'verde' | 'amarillo' | 'rojo' = 'verde';
    
    if (rawScore > 50 && porcentajeAltas > 60) {
      // Solo ROJO si puntaje alto Y más del 60% de respuestas son altas (4-5)
      fallbackState = 'rojo';
    } else if (rawScore > 35 || porcentajeAltas > 40) {
      // AMARILLO si puntaje moderado O más del 40% de respuestas altas
      fallbackState = 'amarillo';
    } else if (rawScore > 20 || porcentajeAltas > 25) {
      // AMARILLO suave si hay indicadores moderados
      fallbackState = 'amarillo';
    } else {
      // VERDE por defecto
      fallbackState = 'verde';
    }

    const systemPrompt = `Eres un psicólogo clínico experto especializado en evaluaciones de salud mental y bienestar emocional. Tu función es analizar respuestas de cuestionarios psicológicos y proporcionar evaluaciones precisas y profesionales. Debes responder ÚNICAMENTE en formato JSON válido, sin comentarios adicionales.`;

    const prompt = `
    Analiza las siguientes respuestas de una evaluación de salud mental (escala 1-5, donde 5 indica mayor gravedad):
    
    ${preguntasRespuestas.map(pr => 
      `- Pregunta: "${pr.pregunta}" (Peso: ${pr.peso})
       - Respuesta: ${pr.respuesta}/5`
    ).join('\n\n')}
    
    CRITERIOS DE EVALUACIÓN:
    - VERDE: Puntaje 0-30 - Estado emocional estable, bienestar general, sin signos de alerta significativos
    - AMARILLO: Puntaje 31-60 - Alerta moderada, algunos síntomas de malestar emocional, requiere atención y seguimiento
    - ROJO: Puntaje 61-100 - Alerta grave, múltiples síntomas de malestar emocional, requiere intervención profesional inmediata
    
    IMPORTANTE: Sé conservador en la evaluación. Solo asigna ROJO si hay evidencia clara de múltiples síntomas graves. 
    Prefiere AMARILLO cuando haya dudas razonables.
    
    Determina:
    1. Un estado de semáforo basado en los criterios anteriores
    2. Un puntaje numérico (0-100) que represente la gravedad general
    3. Una observación clínica profesional y empática sobre el estado mental
    4. Tres recomendaciones prácticas y específicas para el bienestar emocional
    
    Responde SOLO en este formato JSON:
    {
      "estado": "verde/amarillo/rojo",
      "puntaje": 0-100,
      "observaciones": "análisis clínico profesional y empático",
      "recomendaciones": ["recomendación específica 1", "recomendación específica 2", "recomendación específica 3"]
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
    
    // Fallback completo con algoritmo avanzado
    const rawScore = respuestas.reduce((sum, resp) => {
      const pregunta = preguntas.find(p => p.id === resp.pregunta_id);
      return sum + (resp.respuesta * (pregunta?.peso || 1));
    }, 0);

    // Calcular estadísticas para fallback
    let respuestasAltas = 0;
    const totalPreguntas = respuestas.length;
    
    respuestas.forEach(resp => {
      if (resp.respuesta >= 4) respuestasAltas++;
    });
    
    const porcentajeAltas = (respuestasAltas / totalPreguntas) * 100;
    
    // Aplicar criterios estrictos
    let estado: 'verde' | 'amarillo' | 'rojo' = 'verde';
    
    if (rawScore > 50 && porcentajeAltas > 60) {
      estado = 'rojo';
    } else if (rawScore > 35 || porcentajeAltas > 40) {
      estado = 'amarillo';
    } else if (rawScore > 20 || porcentajeAltas > 25) {
      estado = 'amarillo';
    } else {
      estado = 'verde';
    }
    
    return {
      estado,
      puntaje: Math.min(rawScore * 2, 100),
      observaciones: `Evaluación realizada con sistema de respaldo avanzado. Puntaje: ${rawScore}, Respuestas altas: ${porcentajeAltas.toFixed(1)}%`,
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
    const systemPrompt = `Eres un asistente terapéutico especializado en salud mental y bienestar emocional. Tu función es brindar apoyo conversacional empático y profesional, centrado exclusivamente en temas de salud mental, emociones y bienestar personal. 

IMPORTANTE: 
- Solo responde sobre temas relacionados con salud mental, emociones, bienestar personal y desarrollo personal
- Si el usuario pregunta sobre otros temas (programación, tareas académicas, tecnología, etc.), redirige gentilmente hacia temas emocionales
- Mantén un tono cálido, empático y profesional
- Si detectas signos de crisis o pensamientos de autolesión, recomienda buscar ayuda profesional inmediatamente
- Evita dar diagnósticos clínicos específicos
- Sé conservador y empático en tus respuestas`;
    
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
