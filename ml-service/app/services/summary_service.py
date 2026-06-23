import os
import re
import json
from dotenv import load_dotenv
from typing import Dict, Any, List

try:
    from groq import Groq
except ImportError:
    Groq = None

from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

def clean_pdf_text(text: str) -> str:
    text = text.replace("\n", " ")
    text = re.sub(r"--- Page \d+ ---", " ", text)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"([A-Z])\s(?=[A-Z]\s)", r"\1", text)
    return text.strip()

def split_into_sentences(text: str) -> List[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    cleaned = []
    for s in sentences:
        s = s.strip()
        if len(s) > 30 and len(s.split()) >= 5:
            cleaned.append(s)
    return cleaned

def split_text_into_chunks(text: str, max_words: int = 900) -> List[str]:
    words = text.split()
    chunks = []
    current_chunk = []
    
    for word in words:
        current_chunk.append(word)
        if len(current_chunk) >= max_words:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            
    if current_chunk:
        if len(current_chunk) >= 50 or not chunks:
            chunks.append(" ".join(current_chunk))
            
    return chunks

def extract_json(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r'```(?:json)?(.*?)```', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1).strip())
            except json.JSONDecodeError:
                pass
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        raise ValueError("Could not extract valid JSON")

def generate_tfidf_fallback_summary(text: str) -> Dict[str, Any]:
    cleaned_text = clean_pdf_text(text)
    sentences = split_into_sentences(cleaned_text)
    word_count = len(cleaned_text.split())
    
    is_long = word_count > 1200
    points_limit = 20 if is_long else 8
    
    if len(sentences) < 3:
        return {
            "success": True,
            "source": "fallback",
            "main_summary": cleaned_text[:500],
            "important_points": [s for s in sentences],
            "key_terms": [],
            "word_count": word_count,
            "message": "Groq unavailable. Generated using fallback long-text summary." if is_long else "Groq unavailable. Generated using fallback summary."
        }
        
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(sentences)
        scores = np.array(tfidf_matrix.sum(axis=1)).flatten()
        
        ranked_indices = scores.argsort()[::-1]
        
        top_summary_count = min(8 if is_long else 5, len(sentences))
        top_summary_indices = sorted(ranked_indices[:top_summary_count])
        
        main_summary_sentences = [sentences[i] for i in top_summary_indices]
        main_summary = " ".join(main_summary_sentences)
        
        top_points_count = min(points_limit, len(sentences))
        top_points_indices = sorted(ranked_indices[:top_points_count])
        important_points = [sentences[i] for i in top_points_indices]
        
        feature_names = vectorizer.get_feature_names_out()
        tfidf_scores = np.array(tfidf_matrix.sum(axis=0)).flatten()
        term_limit = 20 if is_long else 10
        top_term_indices = tfidf_scores.argsort()[::-1][:term_limit]
        key_terms = [feature_names[i] for i in top_term_indices]
        
    except Exception as e:
        print(f"TF-IDF failed: {e}")
        main_summary = cleaned_text[:500]
        important_points = [cleaned_text[:200]]
        key_terms = []
        
    return {
        "success": True,
        "source": "fallback",
        "main_summary": main_summary,
        "important_points": important_points,
        "key_terms": key_terms,
        "word_count": word_count,
        "message": "Groq unavailable. Generated using fallback long-text summary." if is_long else "Groq unavailable. Generated using fallback summary."
    }

def generate_groq_summary(text: str) -> Dict[str, Any]:
    if not Groq or not GROQ_API_KEY:
        raise ValueError("Groq API not configured")
        
    cleaned_text = clean_pdf_text(text)
    word_count = len(cleaned_text.split())
    
    client = Groq(api_key=GROQ_API_KEY)
    
    if word_count <= 1200:
        # Short text logic
        prompt = f"""
Summarize the following study material. 
Return ONLY a valid JSON object matching exactly this structure, with no markdown, no comments, and no extra text:
{{
  "main_summary": "A clear, student-friendly 3-4 sentence summary of the main topics.",
  "important_points": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "key_terms": ["Term1", "Term2", "Term3", "Term4"]
}}

Rules:
- Keep original meaning correct.
- Do not invent facts.
- Do not remove important definitions.
- Keep important types, examples, steps, and technical terms.
- Use simple student-friendly English.
- If the PDF text is messy, summarize only the clear parts.
- Return up to 8 important points.
- Return up to 10 key terms.

Text to summarize:
{cleaned_text}
"""
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        
        result_data = extract_json(response.choices[0].message.content)
        
        return {
            "success": True,
            "source": "groq",
            "main_summary": result_data.get("main_summary", ""),
            "important_points": result_data.get("important_points", [])[:8],
            "key_terms": result_data.get("key_terms", [])[:10],
            "word_count": word_count,
            "message": "Generated using Groq"
        }
    else:
        # Long text chunk-based logic
        chunks = split_text_into_chunks(cleaned_text, max_words=900)
        
        all_important_points = []
        all_key_terms = []
        section_summaries = []
        
        for idx, chunk in enumerate(chunks):
            chunk_prompt = f"""
Summarize the following section (Part {idx+1} of {len(chunks)}) of a study material.
Return ONLY a valid JSON object matching exactly this structure:
{{
  "section_title": "A short descriptive title for this section",
  "section_summary": "A useful, student-friendly paragraph summarizing this section.",
  "important_points": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "key_terms": ["Term1", "Term2", "Term3"]
}}

Rules:
- Keep original meaning correct. Do not invent facts.
- Keep definitions, examples, steps, types, and technical terms.
- Make the section summary useful, not too short.
- Return 4-8 important points if possible.
- Use simple English.

Text chunk:
{chunk}
"""
            try:
                response = client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=[{"role": "user", "content": chunk_prompt}],
                    temperature=0.3,
                    max_tokens=800,
                    response_format={"type": "json_object"}
                )
                chunk_data = extract_json(response.choices[0].message.content)
                
                section_title = chunk_data.get("section_title", f"Section {idx+1}")
                section_summary = chunk_data.get("section_summary", "")
                pts = chunk_data.get("important_points", [])
                terms = chunk_data.get("key_terms", [])
                
                if section_summary:
                    section_summaries.append({
                        "section_title": section_title,
                        "section_summary": section_summary,
                        "important_points": pts
                    })
                
                for p in pts:
                    if p not in all_important_points:
                        all_important_points.append(p)
                for t in terms:
                    if t not in all_key_terms:
                        all_key_terms.append(t)
            except Exception as e:
                print(f"Failed to summarize chunk {idx+1}: {e}")
                
        all_important_points = all_important_points[:20]
        all_key_terms = all_key_terms[:20]
        
        combined_summaries = "\n\n".join([f"{s['section_title']}:\n{s['section_summary']}" for s in section_summaries])
        
        final_prompt = f"""
Based on the following section summaries of a long study document, write a comprehensive overall summary.
Return ONLY a valid JSON object matching exactly this structure:
{{
  "main_summary": "Detailed overall summary here..."
}}

Section Summaries:
{combined_summaries}
"""
        main_summary = ""
        try:
            final_res = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": final_prompt}],
                temperature=0.3,
                max_tokens=600,
                response_format={"type": "json_object"}
            )
            final_data = extract_json(final_res.choices[0].message.content)
            main_summary = final_data.get("main_summary", "")
        except Exception as e:
            print(f"Final summary generation failed: {e}")
            if section_summaries:
                main_summary = " ".join([s["section_summary"] for s in section_summaries])
        
        return {
            "success": True,
            "source": "groq",
            "main_summary": main_summary,
            "important_points": all_important_points,
            "key_terms": all_key_terms,
            "section_summaries": section_summaries,
            "word_count": word_count,
            "message": "Generated using Groq chunk-based summary"
        }

def generate_summary(text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        raise ValueError("Text is required for summary generation")
        
    try:
        return generate_groq_summary(text)
    except Exception as e:
        print(f"Groq summary failed: {e}")
        return generate_tfidf_fallback_summary(text)