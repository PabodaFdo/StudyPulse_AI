from pydantic import BaseModel, Field
from typing import List, Optional


class HealthResponse(BaseModel):
    success: bool
    message: str
    timestamp: str


class AcademicRiskRequest(BaseModel):
    attendancePercentage: float = Field(..., ge=0, le=100)
    assignmentAverage: float = Field(..., ge=0, le=100)
    quizAverage: float = Field(..., ge=0, le=100)
    studyHoursPerWeek: float = Field(..., ge=0)
    missedDeadlines: int = Field(..., ge=0)
    focusSessionsCompleted: int = Field(..., ge=0)
    previousExamMark: float = Field(..., ge=0, le=100)


class AcademicRiskResponse(BaseModel):
    riskLevel: str
    confidence: float
    reasons: List[str]
    recommendations: List[str]


class SubjectHealthRequest(BaseModel):
    subjectName: str = Field(..., min_length=2)
    attendancePercentage: float = Field(..., ge=0, le=100)
    averageMark: float = Field(..., ge=0, le=100)
    quizAverage: float = Field(..., ge=0, le=100)
    studyHoursThisWeek: float = Field(..., ge=0)
    focusSessionsCompleted: int = Field(..., ge=0)
    notesCount: int = Field(..., ge=0)
    missedDeadlines: int = Field(..., ge=0)


class SubjectHealthResponse(BaseModel):
    subjectName: str
    healthScore: int
    status: str
    strengths: List[str]
    concerns: List[str]
    recommendations: List[str]

class WeakTopicRequest(BaseModel):
    topicName: str = Field(..., min_length=2)
    quizScore: float = Field(..., ge=0, le=100)
    wrongAnswers: int = Field(..., ge=0)
    attemptCount: int = Field(..., ge=1)
    timeSpentMinutes: float = Field(..., ge=0)
    daysSinceLastStudy: int = Field(..., ge=0)
    confidenceLevel: int = Field(..., ge=1, le=5)
    topicDifficulty: int = Field(..., ge=1, le=5)


class WeakTopicResponse(BaseModel):
    topicName: str
    topicStatus: str
    confidence: float
    reasons: List[str]
    recommendations: List[str]

class PdfExtractResponse(BaseModel):
    filename: str
    pageCount: int
    characterCount: int
    text: str
    message: str


class SummaryRequest(BaseModel):
    text: str = Field(..., min_length=10)


class SectionSummary(BaseModel):
    section_title: str
    section_summary: str
    important_points: List[str]


class SummaryResponse(BaseModel):
    success: bool
    source: str
    main_summary: str
    important_points: List[str]
    key_terms: List[str]
    section_summaries: Optional[List[SectionSummary]] = None
    word_count: int
    message: str


class QuizQuestion(BaseModel):
    id: int
    type: str
    question: str
    options: List[str]
    correct_answer: str
    explanation: str


class QuizRequest(BaseModel):
    text: str = Field(..., min_length=10)
    question_count: Optional[int] = Field(5, ge=1, le=10)
    difficulty: Optional[str] = Field("medium")


class QuizResponse(BaseModel):
    success: bool
    source: str
    questions: List[QuizQuestion]
    word_count: int
    message: str


class Flashcard(BaseModel):
    id: int
    front: str
    back: str
    category: str
    difficulty: str


class FlashcardRequest(BaseModel):
    text: str = Field(..., min_length=10)
    card_count: Optional[int] = Field(10, ge=1, le=20)
    difficulty: Optional[str] = Field("medium")


class FlashcardResponse(BaseModel):
    success: bool
    source: str
    flashcards: List[Flashcard]
    word_count: int
    message: str