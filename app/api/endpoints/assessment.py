from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.dependencies import get_current_active_user, get_current_active_superuser
from app.db.session import get_session
from app.models.user import User
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentAnswer, MoodStatus
from app.schemas.assessment import (
    AssessmentQuestion as AssessmentQuestionSchema,
    AssessmentQuestionCreate,
    Assessment as AssessmentSchema,
    AssessmentCreate,
    AssessmentResponse,
    AssessmentSubmission,
)
from app.services.assessment_service import analyze_responses, get_recommendations

router = APIRouter()

@router.get("/questions", response_model=List[AssessmentQuestionSchema])
async def get_questions(
    db: AsyncSession = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtiene la lista de preguntas para evaluación de salud mental.
    """
    result = await db.execute(
        select(AssessmentQuestion)
        .where(AssessmentQuestion.is_active == True)
        .order_by(AssessmentQuestion.order)
        .offset(skip)
        .limit(limit)
    )
    questions = result.scalars().all()
    return questions

@router.post("/questions", response_model=AssessmentQuestionSchema)
async def create_question(
    *,
    db: AsyncSession = Depends(get_session),
    question_in: AssessmentQuestionCreate,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Crea una nueva pregunta (solo superusuarios).
    """
    db_obj = AssessmentQuestion(**question_in.dict())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.post("/submit", response_model=AssessmentResponse)
async def submit_assessment(
    *,
    db: AsyncSession = Depends(get_session),
    assessment_in: AssessmentSubmission,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Procesa las respuestas del usuario y retorna una evaluación de salud mental.
    """
    # Analizar respuestas y determinar estado
    status, summary = await analyze_responses(assessment_in.answers)
    recommendations = get_recommendations(status)
    
    # Crear la evaluación en la base de datos
    db_assessment = Assessment(
        user_id=current_user.id,
        status=status,
        summary=summary,
        recommendations=recommendations,
    )
    db.add(db_assessment)
    await db.commit()
    await db.refresh(db_assessment)
    
    # Guardar las respuestas
    for answer in assessment_in.answers:
        db_answer = AssessmentAnswer(
            assessment_id=db_assessment.id,
            question_id=answer["question_id"],
            answer_text=answer["answer_text"],
        )
        db.add(db_answer)
    
    await db.commit()
    
    # Determinar si es necesario contactar a un psicólogo
    contact_psychologist = status == MoodStatus.RED
    
    return AssessmentResponse(
        status=status,
        summary=summary,
        recommendations=recommendations,
        contact_psychologist=contact_psychologist,
    )

@router.get("/history", response_model=List[AssessmentSchema])
async def get_assessment_history(
    db: AsyncSession = Depends(get_session),
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtiene el historial de evaluaciones del usuario.
    """
    result = await db.execute(
        select(Assessment)
        .where(Assessment.user_id == current_user.id)
        .order_by(Assessment.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    assessments = result.scalars().all()
    return assessments 