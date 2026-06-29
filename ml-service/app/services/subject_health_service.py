def calculate_subject_health(data):
    """
    Rule-based subject health scoring.
    Score range: 0 - 100
    """

    mark_component = data.averageMark * 0.35
    quiz_component = data.quizAverage * 0.25
    attendance_component = data.attendancePercentage * 0.25

    study_hours_component = min(data.studyHoursThisWeek / 5, 1) * 5
    focus_component = min(data.focusSessionsCompleted / 3, 1) * 5
    notes_component = min(data.notesCount / 3, 1) * 5

    deadline_penalty = min(data.missedDeadlines * 8, 20)

    raw_score = (
        mark_component
        + quiz_component
        + attendance_component
        + study_hours_component
        + focus_component
        + notes_component
        - deadline_penalty
    )

    health_score = max(0, min(100, round(raw_score)))

    if health_score >= 80:
        status = "Healthy"
    elif health_score >= 65:
        status = "Good"
    else:
        status = "Needs Attention"

    strengths = []
    concerns = []
    recommendations = []

    if data.averageMark >= 70:
        strengths.append("Average marks are strong")
    else:
        concerns.append("Average marks need improvement")
        recommendations.append("Revise weak lessons and practice past questions")

    if data.quizAverage >= 70:
        strengths.append("Quiz performance is stable")
    else:
        concerns.append("Quiz performance is below target")
        recommendations.append("Use short quizzes to revise this subject regularly")

    if data.attendancePercentage >= 80:
        strengths.append("Study engagement is strong")
    else:
        concerns.append("Study engagement needs improvement")
        recommendations.append("Increase study activity through quizzes, notes, and focus sessions")

    if data.studyHoursThisWeek >= 5:
        strengths.append("Study time is consistent")
    else:
        concerns.append("Study hours are low for this subject")
        recommendations.append("Schedule more focused study hours this week")

    if data.focusSessionsCompleted >= 3:
        strengths.append("Focus sessions are being completed")
    else:
        concerns.append("Focus session count is low")
        recommendations.append("Complete more focus sessions for this subject")

    if data.notesCount >= 3:
        strengths.append("Study notes are available")
    else:
        concerns.append("Not enough notes are available")
        recommendations.append("Upload or create more notes for this subject")

    if data.missedDeadlines > 0:
        concerns.append("There are missed deadlines")
        recommendations.append("Prioritize pending work and reduce missed deadlines")

    if not strengths:
        strengths.append("No strong indicators found yet")

    if not concerns:
        concerns.append("Subject indicators are currently stable")

    if not recommendations:
        recommendations.append("Maintain your current study routine")

    return {
        "subjectName": data.subjectName,
        "healthScore": health_score,
        "status": status,
        "strengths": strengths,
        "concerns": concerns,
        "recommendations": recommendations,
    }