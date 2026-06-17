from pydantic import BaseModel, Field
from typing import List


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