import os
import re
import json
from dotenv import load_dotenv
from typing import Dict, Any

try:
    from groq import Groq
except ImportError:
    Groq = None

from app.services.summary_service import extract_json, clean_pdf_text, split_into_sentences

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

def generate_fallback_quiz(text: str, question_count: int = 5) -> Dict[str, Any]:
    cleaned_text = clean_pdf_text(text)
    sentences = split_into_sentences(cleaned_text)
    word_count = len(cleaned_text.split())
    
    questions = []
    
    # Just grab some sentences to make short answer questions
    # Fallback to simple rule-based generation
    limit = min(question_count, len(sentences))
    for i in range(limit):
        sentence = sentences[i]
        questions.append({
            "id": i + 1,
            "type": "short_answer",
            "question": f"Explain this concept: {sentence}",
            "options": [],
            "correct_answer": sentence,
            "explanation": "This question is generated from an important sentence in the study text."
        })
        
    return {
        "success": True,
        "source": "fallback",
        "questions": questions,
        "word_count": word_count,
        "message": "Groq unavailable. Generated using fallback quiz."
    }

def generate_groq_quiz(text: str, question_count: int = 5, difficulty: str = "medium") -> Dict[str, Any]:
    if not Groq or not GROQ_API_KEY:
        raise ValueError("Groq API not configured")
        
    cleaned_text = clean_pdf_text(text)
    word_count = len(cleaned_text.split())
    
    # Simple truncate to avoid massive token limits if it's too long
    max_words = 3000
    if word_count > max_words:
        cleaned_text = " ".join(cleaned_text.split()[:max_words])
        
    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
Generate {question_count} quiz questions based ONLY on the following study text. The difficulty should be {difficulty}.

Return ONLY a valid JSON object matching exactly this structure, with no markdown, no comments, and no extra text:
{{
  "questions": [
    {{
      "id": 1,
      "type": "mcq",
      "question": "What is...?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "explanation": "Because..."
    }}
  ]
}}

Rules:
- Generate quiz questions only from the provided text.
- Do not invent facts.
- Use student-friendly language.
- Include exactly 4 answer options for each MCQ.
- Only one correct answer.
- Include a short explanation.
- Avoid duplicate questions.
- Match the requested {difficulty} difficulty.

Text:
{cleaned_text}
"""
    
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1500,
        response_format={"type": "json_object"}
    )
    
    result_data = extract_json(response.choices[0].message.content)
    questions = result_data.get("questions", [])
    
    # Clean generated options to remove duplicate labels like A), A., Option A:
    for q in questions:
        if q.get("type") == "mcq" and "options" in q and isinstance(q["options"], list):
            cleaned_options = []
            for opt in q["options"]:
                clean_opt = re.sub(r'^\s*(?:Option\s+)?(?:[A-Da-d][\.\:\-\)]|\([A-Da-d]\))\s*', '', str(opt), flags=re.IGNORECASE).strip()
                cleaned_options.append(clean_opt)
            q["options"] = cleaned_options
            
            if "correct_answer" in q:
                q["correct_answer"] = re.sub(r'^\s*(?:Option\s+)?(?:[A-Da-d][\.\:\-\)]|\([A-Da-d]\))\s*', '', str(q["correct_answer"]), flags=re.IGNORECASE).strip()
    
    return {
        "success": True,
        "source": "groq",
        "questions": questions,
        "word_count": word_count,
        "message": "Generated using Groq"
    }

def generate_quiz(text: str, question_count: int = 5, difficulty: str = "medium") -> Dict[str, Any]:
    if not text or not text.strip():
        raise ValueError("Text is required for quiz generation")
        
    try:
        return generate_groq_quiz(text, question_count, difficulty)
    except Exception as e:
        print(f"Groq quiz failed: {e}")
        return generate_fallback_quiz(text, question_count)
