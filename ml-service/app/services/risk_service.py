from pathlib import Path

import joblib
import numpy as np


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "academic_risk_model.pkl"
ENCODER_PATH = BASE_DIR / "models" / "risk_label_encoder.pkl"


def predict_academic_risk_rule_based(data):
    reasons = []
    recommendations = []

    # Calculate risk probability directly
    engagement_risk = max(0, 100 - data.attendancePercentage)
    assignment_risk = max(0, 100 - data.assignmentAverage)
    quiz_risk = max(0, 100 - data.quizAverage)
    exam_risk = max(0, 100 - data.previousExamMark)

    risk_score = (
        engagement_risk * 0.30 +
        assignment_risk * 0.25 +
        quiz_risk * 0.25 +
        exam_risk * 0.20
    )

    if data.attendancePercentage < 75:
        reasons.append("Study engagement is below 75%")
        recommendations.append("Complete more study activities for this subject")

    if data.assignmentAverage < 60:
        reasons.append("Assignment average is low")
        recommendations.append("Complete assignments earlier and review feedback")

    if data.quizAverage < 60:
        reasons.append("Quiz performance is low")
        recommendations.append("Revise weak topics using flashcards and quizzes")

    if data.studyHoursPerWeek < 5:
        risk_score += 5
        reasons.append("Weekly study hours are low")
        recommendations.append("Plan at least 5 focused study hours per week")

    if data.missedDeadlines >= 2:
        risk_score += 10
        reasons.append("Multiple deadlines were missed")
        recommendations.append("Use study quests and reminders to track deadlines")

    if data.focusSessionsCompleted < 3:
        risk_score += 5
        reasons.append("Focus session count is low")
        recommendations.append("Complete at least 3 focus sessions this week")

    if data.previousExamMark < 50:
        reasons.append("Previous exam mark is low")
        recommendations.append("Focus on high-priority weak subjects first")

    risk_score = min(max(round(risk_score), 0), 100)

    if risk_score >= 70:
        risk_level = "High Risk"
    elif risk_score >= 40:
        risk_level = "Medium Risk"
    else:
        risk_level = "Low Risk"

    if not reasons:
        reasons.append("Academic indicators are currently stable")

    if not recommendations:
        recommendations.append("Maintain your current study routine")

    return {
        "riskLevel": risk_level,
        "confidence": risk_score / 100.0,
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

    classes = list(encoder.classes_)
    idx_high = classes.index("High Risk") if "High Risk" in classes else -1
    idx_med = classes.index("Medium Risk") if "Medium Risk" in classes else -1
    idx_low = classes.index("Low Risk") if "Low Risk" in classes else -1

    # Calculate expected risk probability (0-100)
    risk_prob = 0
    if idx_high != -1: risk_prob += probabilities[idx_high] * 90
    if idx_med != -1: risk_prob += probabilities[idx_med] * 50
    if idx_low != -1: risk_prob += probabilities[idx_low] * 10
    
    risk_score = min(max(round(risk_prob), 0), 100)
    
    if risk_score >= 70:
        risk_level = "High Risk"
    elif risk_score >= 40:
        risk_level = "Medium Risk"
    else:
        risk_level = "Low Risk"

    return {
        "riskLevel": risk_level,
        "confidence": risk_score / 100.0,
        "reasons": rule_based_result["reasons"],
        "recommendations": rule_based_result["recommendations"],
    }