from typing import Optional, List, Any
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.assessment import MoodStatus

# Esquemas para AssessmentQuestion
class AssessmentQuestionBase(BaseModel):
    text: str
    order: Optional[int] = 0
    is_active: bool = True

class AssessmentQuestionCreate(AssessmentQuestionBase):
    pass

class AssessmentQuestionUpdate(AssessmentQuestionBase):
    text: Optional[str] = None
    is_active: Optional[bool] = None

class AssessmentQuestionInDBBase(AssessmentQuestionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AssessmentQuestion(AssessmentQuestionInDBBase):
    pass

# Esquemas para AssessmentAnswer
class AssessmentAnswerBase(BaseModel):
    question_id: int
    answer_text: str

class AssessmentAnswerCreate(AssessmentAnswerBase):
    pass

class AssessmentAnswerUpdate(AssessmentAnswerBase):
    answer_text: Optional[str] = None

class AssessmentAnswerInDBBase(AssessmentAnswerBase):
    id: int
    assessment_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AssessmentAnswer(AssessmentAnswerInDBBase):
    question: AssessmentQuestion

# Esquemas para Assessment
class AssessmentBase(BaseModel):
    status: MoodStatus
    summary: Optional[str] = None
    recommendations: Optional[str] = None

class AssessmentCreate(BaseModel):
    answers: List[AssessmentAnswerCreate]

class AssessmentUpdate(AssessmentBase):
    status: Optional[MoodStatus] = None

class AssessmentInDBBase(AssessmentBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Assessment(AssessmentInDBBase):
    answers: List[AssessmentAnswer] = []

# Esquema para enviar respuestas y recibir evaluación
class AssessmentSubmission(BaseModel):
    answers: List[dict]

class AssessmentResponse(BaseModel):
    status: MoodStatus
    summary: str
    recommendations: str
    contact_psychologist: bool 