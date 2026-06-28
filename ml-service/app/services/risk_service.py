from pathlib import Path

import joblib
import numpy as np


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "academic_risk_model.pkl"
ENCODER_PATH = BASE_DIR / "models" / "risk_label_encoder.pkl"


def predict_academic_risk_rule_based(data):
    risk_score = 0
    reasons = []
    recommendations = []

    if data.attendancePercentage < 75:
        risk_score += 20
        reasons.append("Study engagement is below 75%")
        recommendations.append("Complete more study activities for this subject")

    if data.assignmentAverage < 60:
        risk_score += 2
        reasons.append("Assignment average is low")
        recommendations.append("Complete assignments earlier and review feedback")

    if data.quizAverage < 60:
        risk_score += 2
        reasons.append("Quiz performance is low")
        recommendations.append("Revise weak topics using flashcards and quizzes")

    if data.studyHoursPerWeek < 5:
        risk_score += 1
        reasons.append("Weekly study hours are low")
        recommendations.append("Plan at least 5 focused study hours per week")

    if data.missedDeadlines >= 2:
        risk_score += 2
        reasons.append("Multiple deadlines were missed")
        recommendations.append("Use study quests and reminders to track deadlines")

    if data.focusSessionsCompleted < 3:
        risk_score += 1
        reasons.append("Focus session count is low")
        recommendations.append("Complete at least 3 focus sessions this week")

    if data.previousExamMark < 50:
        risk_score += 2
        reasons.append("Previous exam mark is low")
        recommendations.append("Focus on high-priority weak subjects first")

    if risk_score >= 7:
        risk_level = "High Risk"
        confidence = 0.85
    elif risk_score >= 4:
        risk_level = "Medium Risk"
        confidence = 0.75
    else:
        risk_level = "Low Risk"
        confidence = 0.70

    if not reasons:
        reasons.append("Academic indicators are currently stable")

    if not recommendations:
        recommendations.append("Maintain your current study routine")

    return {
        "riskLevel": risk_level,
        "confidence": confidence,
        "reasons": reasons,
        "recommendations": recommendations,
    }


def load_model():
    if MODEL_PATH.exists() and ENCODER_PATH.exists():
        loaded_model = joblib.load(MODEL_PATH)
        loaded_encoder = joblib.load(ENCODER_PATH)
        return loaded_model, loaded_encoder

    return None, None


model, encoder = load_model()


def predict_academic_risk_ml(data):
    """
    Predict academic risk using trained ML model.
    If model files are missing, use rule-based fallback.
    """

    rule_based_result = predict_academic_risk_rule_based(data)

    if model is None or encoder is None:
        return rule_based_result

    features = np.array([[
        data.attendancePercentage,
        data.assignmentAverage,
        data.quizAverage,
        data.studyHoursPerWeek,
        data.missedDeadlines,
        data.focusSessionsCompleted,
        data.previousExamMark,
    ]])

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]

    risk_level = encoder.inverse_transform([prediction])[0]
    confidence = float(max(probabilities))

    return {
        "riskLevel": risk_level,
        "confidence": round(confidence, 2),
        "reasons": rule_based_result["reasons"],
        "recommendations": rule_based_result["recommendations"],
    }