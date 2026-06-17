from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.schemas import AcademicRiskRequest, AcademicRiskResponse
from app.services.risk_service import predict_academic_risk_ml

from app.schemas import SubjectHealthRequest, SubjectHealthResponse
from app.services.subject_health_service import calculate_subject_health

from app.schemas import WeakTopicRequest, WeakTopicResponse
from app.services.weak_topic_service import predict_weak_topic

app = FastAPI(
    title="StudyPulse ML Service",
    description="Machine learning microservice for StudyPulse AI",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "StudyPulse AI ML Service is running"
    }


@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "StudyPulse ML service is healthy",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/predict-risk", response_model=AcademicRiskResponse)
def predict_risk(data: AcademicRiskRequest):
    return predict_academic_risk_ml(data)

@app.post("/subject-health", response_model=SubjectHealthResponse)
def subject_health(data: SubjectHealthRequest):
    return calculate_subject_health(data)

@app.post("/predict-weak-topic", response_model=WeakTopicResponse)
def weak_topic_prediction(data: WeakTopicRequest):
    return predict_weak_topic(data)