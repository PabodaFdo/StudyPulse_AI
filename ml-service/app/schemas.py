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
