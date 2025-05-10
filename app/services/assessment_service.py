from typing import List, Dict, Tuple, Any
import json

from openai import AsyncOpenAI
from app.core.config import settings
from app.models.assessment import MoodStatus

# Cliente de OpenAI
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def analyze_responses(answers: List[Dict[str, Any]]) -> Tuple[MoodStatus, str]:
    """
    Analiza las respuestas del usuario utilizando OpenAI para determinar el estado de ánimo.
    
    Args:
        answers: Lista de respuestas del usuario con formato {"question_id": id, "answer_text": texto}
        
    Returns:
        Tuple con el estado de ánimo (MoodStatus) y un resumen del análisis
    """
    # Preparar el contenido para el prompt
    answer_texts = [f"Pregunta {a['question_id']}: {a['answer_text']}" for a in answers]
    answers_text = "\n".join(answer_texts)
    
    prompt = f"""
    Analiza las siguientes respuestas de un usuario sobre su estado de salud mental:
    
    {answers_text}
    
    Clasifica su estado según el sistema de semáforo:
    - VERDE: Estado mental óptimo, sin signos de problemas emocionales significativos.
    - AMARILLO: Estado de precaución, con algunos signos de estrés, ansiedad leve o tristeza que requieren atención.
    - ROJO: Estado de alerta, con señales claras de depresión, ansiedad severa, pensamientos negativos recurrentes o ideación suicida.
    
    Proporciona tu respuesta en formato JSON con los siguientes campos:
    - status: "green", "yellow" o "red"
    - summary: Un resumen del análisis psicológico de 3-5 oraciones
    """
    
    # Llamar a la API de OpenAI
    response = await client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "Eres un psicólogo experto en evaluación de salud mental."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=500,
    )
    
    # Extraer y procesar la respuesta
    try:
        ai_response = response.choices[0].message.content.strip()
        # Intentar extraer el JSON del texto de respuesta
        json_start = ai_response.find('{')
        json_end = ai_response.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            json_str = ai_response[json_start:json_end]
            analysis = json.loads(json_str)
        else:
            # Fallback si no se encuentra formato JSON
            analysis = {
                "status": "yellow",  # Por defecto estado amarillo si hay problemas
                "summary": "No se pudo determinar con claridad el estado mental. Se recomienda una evaluación más detallada."
            }
            
        # Convertir el estado de texto a enum
        status_map = {
            "green": MoodStatus.GREEN,
            "yellow": MoodStatus.YELLOW,
            "red": MoodStatus.RED
        }
        status = status_map.get(analysis["status"].lower(), MoodStatus.YELLOW)
        
        return status, analysis["summary"]
    except Exception as e:
        # En caso de error, retornar un valor por defecto
        return MoodStatus.YELLOW, f"Error al analizar las respuestas: Se recomienda una evaluación más detallada."

def get_recommendations(status: MoodStatus) -> str:
    """
    Retorna recomendaciones según el estado de ánimo
    """
    recommendations = {
        MoodStatus.GREEN: """
        Tu estado de ánimo se encuentra en un nivel óptimo. Recomendaciones:
        - Continúa con tus actividades diarias y hábitos saludables
        - Mantén tu rutina de ejercicio y alimentación balanceada
        - Practica la gratitud y mindfulness para mantener este estado
        - Recuerda la importancia del descanso adecuado
        """,
        
        MoodStatus.YELLOW: """
        Tu estado de ánimo muestra algunas señales de precaución. Recomendaciones:
        - Incrementa actividades de autocuidado y relajación
        - Considera técnicas de manejo del estrés como meditación o yoga
        - Habla sobre tus sentimientos con amigos o familiares de confianza
        - Establece límites claros en tus responsabilidades
        - Asegúrate de dormir adecuadamente y mantener una alimentación saludable
        """,
        
        MoodStatus.RED: """
        Tu estado de ánimo muestra señales importantes que requieren atención. Recomendaciones:
        - Es recomendable buscar apoyo profesional. Te podemos conectar con un psicólogo
        - No enfrentes estos sentimientos solo/a, busca apoyo en tu red de confianza
        - Reduce factores estresantes en tu vida si es posible
        - Estructura tu día con actividades simples y alcanzables
        - Recuerda que estos estados son temporales y con el apoyo adecuado pueden mejorar
        - Si tienes pensamientos de hacerte daño, llama inmediatamente a una línea de crisis
        """
    }
    
    return recommendations.get(status, "Por favor busca una evaluación más detallada con un profesional.") 