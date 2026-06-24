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

def clean_text(text: str) -> str:
    return clean_pdf_text(text)

def generate_fallback_flashcards(text: str, card_count: int = 10, difficulty: str = "medium") -> Dict[str, Any]:
    cleaned = clean_text(text)
    sentences = split_into_sentences(cleaned)
    word_count = len(cleaned.split())
    
    flashcards = []
    
    limit = min(card_count, len(sentences))
    for i in range(limit):
        sentence = sentences[i]
        flashcards.append({
            "id": i + 1,
            "front": "Explain this concept",
            "back": sentence,
            "category": "Important Point",
            "difficulty": difficulty
        })
        
    return {
        "success": True,
        "source": "fallback",
        "flashcards": flashcards,
        "word_count": word_count,
        "message": "Groq unavailable. Generated using fallback flashcards."
    }

def generate_groq_flashcards(text: str, card_count: int = 10, difficulty: str = "medium") -> Dict[str, Any]:
    if not Groq or not GROQ_API_KEY:
        raise ValueError("Groq API not configured")
        
    cleaned = clean_text(text)
    word_count = len(cleaned.split())
    
    max_words = 3000
    if word_count > max_words:
        cleaned = " ".join(cleaned.split()[:max_words])
        
    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
Generate {card_count} flashcards based ONLY on the following study text. The difficulty should be {difficulty}.

Return ONLY a valid JSON object matching exactly this structure, with no markdown, no comments, and no extra text:
{{
  "flashcards": [
    {{
      "id": 1,
      "front": "Question or term here",
      "back": "Answer or explanation here",
      "category": "Definition",
      "difficulty": "medium"
    }}
  ]
}}

Rules:
- Generate flashcards only from the provided text.
- Do not invent facts.
- Use student-friendly language.
- Front side should be short and clear.
- Back side should explain the answer clearly.
- Include definitions, key terms, examples, processes, and important facts.
- Avoid duplicate flashcards.
- Match the requested {difficulty} difficulty.
- Return valid JSON only.

Text:
{cleaned}
"""
    
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1500,
        response_format={"type": "json_object"}
    )
    
    result_data = extract_json(response.choices[0].message.content)
    flashcards = result_data.get("flashcards", [])
    
    return {
        "success": True,
        "source": "groq",
        "flashcards": flashcards,
        "word_count": word_count,
        "message": "Generated using Groq"
    }

def generate_flashcards(text: str, card_count: int = 10, difficulty: str = "medium") -> Dict[str, Any]:
    if not text or not text.strip():
        raise ValueError("Text is required for flashcard generation")
        
    try:
        return generate_groq_flashcards(text, card_count, difficulty)
    except Exception as e:
        print(f"Groq flashcards failed: {e}")
        return generate_fallback_flashcards(text, card_count, difficulty)
