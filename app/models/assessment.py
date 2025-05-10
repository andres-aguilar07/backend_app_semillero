from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base

class MoodStatus(str, enum.Enum):
    """
    Enumeración para los estados de ánimo (semáforo)
    """
    GREEN = "green"  # Estado óptimo
    YELLOW = "yellow"  # Estado de precaución
    RED = "red"  # Estado de alerta

class Assessment(Base):
    """
    Modelo para registrar evaluaciones de salud mental
    """
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(MoodStatus), nullable=False)
    summary = Column(Text)
    recommendations = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    user = relationship("User", back_populates="assessments")
    answers = relationship("AssessmentAnswer", back_populates="assessment", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Assessment {self.id}: {self.status}>"

class AssessmentQuestion(Base):
    """
    Modelo para preguntas de evaluación de salud mental
    """
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    answers = relationship("AssessmentAnswer", back_populates="question")
    
    def __repr__(self):
        return f"<Question {self.id}: {self.text[:30]}...>"

class AssessmentAnswer(Base):
    """
    Modelo para respuestas a preguntas de evaluación
    """
    __tablename__ = "assessment_answers"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("assessment_questions.id"), nullable=False)
    answer_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    assessment = relationship("Assessment", back_populates="answers")
    question = relationship("AssessmentQuestion", back_populates="answers")
    
    def __repr__(self):
        return f"<Answer {self.id} for question {self.question_id}>" 