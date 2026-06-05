import google.generativeai as genai
import json
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

def resolve_gemini_model() -> str:
    preferred = os.getenv("GEMINI_MODEL", "").strip()
    candidates = [
        preferred,
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-3.1-flash-preview",
        "gemini-3.1-flash-lite-preview",
        "gemini-3-flash-preview",
        "gemini-3-pro-preview",
    ]

    try:
        models = list(genai.list_models())
        supported = []
        for model in models:
            methods = set(getattr(model, "supported_generation_methods", []) or [])
            if "generateContent" not in methods:
                continue
            name = getattr(model, "name", "")
            if not name:
                continue
            supported.append(name.removeprefix("models/"))

        for candidate in candidates:
            if candidate and candidate in supported:
                return candidate

        if supported:
            return supported[0]
    except Exception as e:
        print(f"Error listing Gemini models: {e}. Falling back to default.")

    # Fallback default if API call fails or lists no models
    return "gemini-1.5-flash"

class CVAnalysisService:
    @staticmethod
    async def analyze_resume_data(raw_text: str, job_title: str = "Senior Role") -> dict:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"candidate_name": "Error: Missing API Key", "score": 0, "red_flags": [], "improvements": []}
            
        genai.configure(api_key=api_key)
        model_name = resolve_gemini_model()
        model = genai.GenerativeModel(model_name)
        
        target_countries_list = job_title.get('target_countries', []) if isinstance(job_title, dict) else []
        target_countries_str = ", ".join(target_countries_list) if target_countries_list else "Global (Infer from resume)"
        relocation_pref = "Ready to relocate anywhere" if isinstance(job_title, dict) and job_title.get('anywhere') else "Specific regions"
        real_job_title = job_title.get('title', 'Senior Role') if isinstance(job_title, dict) else job_title

        parsing_prompt = f"""
        You are an expert ATS data extraction system.
        Extract structured details from this raw RESUME TEXT. Focus on extracting verbatim information, including Name, Email, Skills, Experience, and Education. 
        If the name is fragmented due to PDF parsing (e.g. "S S HYAM UNDER"), intelligently reconstruct it (e.g. "SHYAM SUNDER").

        RESUME TEXT:
        {raw_text}

        Return ONLY valid JSON in this structure:
        {{
            "name": "Full Name",
            "email": "Email Address",
            "skills": ["skill 1", "skill 2"],
            "experience": ["Job 1 details", "Job 2 details"],
            "education": ["Degree 1", "Degree 2"]
        }}
        """

        generation_config = {
            "temperature": 0.1,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
            "response_mime_type": "application/json"
        }

        try:
            print(f"Attempting parsing using model: {model_name}")
            model = genai.GenerativeModel(model_name)
            step1_response = await asyncio.to_thread(model.generate_content, parsing_prompt, generation_config=generation_config)
            parsed_cv = step1_response.text.strip()
        except Exception as e:
            print(f"Primary model {model_name} failed parsing: {e}. Falling back to gemini-2.5-flash...")
            try:
                fallback_model = genai.GenerativeModel("gemini-2.5-flash")
                step1_response = await asyncio.to_thread(fallback_model.generate_content, parsing_prompt, generation_config=generation_config)
                parsed_cv = step1_response.text.strip()
            except Exception as fallback_err:
                print(f"Fallback parsing failed: {fallback_err}")
                raise fallback_err

        eval_prompt = f"""
        You are a highly deterministic, elite ATS and Career Architect.
        
        INPUT CONTEXT:
        - TARGET ROLE: {real_job_title}
        - MARKET_MODE: {"GLOBAL" if isinstance(job_title, dict) and job_title.get('anywhere') else "SPECIFIC"}
        - TARGET COUNTRIES: {target_countries_str}
        - RELOCATION PREFERENCE: {relocation_pref}
        - PARSED RESUME: {parsed_cv}

        TASK: Deeply evaluate the parsed resume against the target role. Provide a highly professional, detailed report.
        
        SCORING RULES: Calculate ATS Score based on exact weights (0.3KS, 0.2SS, 0.2EX, 0.1ED, 0.1FS, 0.1AC).
        
        MARKET ANALYSIS RULES: Provide realistic salary estimates and percentiles. If GLOBAL, use USD.

        AREAS OF WEAKNESS (RED FLAGS): Identify critical gaps, missing mandatory skills, or weak experience points relative to the job description. Be brutally honest but constructive.
        
        IMPROVEMENTS (GENERAL CAREER IMPROVEMENTS): Provide highly specific, actionable steps to improve the candidate's profile.

        UPSKILLING COURSES: Suggest exactly 5 highly relevant courses to bridge the gaps. 
        CRITICAL: For the `url`, you MUST generate a valid search URL for Coursera or Udemy based on the course name. 
        Example: "https://www.coursera.org/search?query=Machine+Learning" or "https://www.udemy.com/courses/search/?q=Advanced+React". 
        DO NOT leave the url empty or use placeholder links.

        RESPOND ONLY WITH VALID JSON IN THIS EXACT STRUCTURE:
        {{
            "candidate_metadata": {{
                "name": "[Extracted Name from Parsed Resume]",
                "email": "Email Address",
                "current_title": "Current Job Title",
                "total_years_exp": 0.0,
                "relevant_years_exp": 0.0,
                "detected_country": "Detected Country",
                "target_region_fit": "Analysis..."
            }},
            "overall_ats_score": 85,
            "suggested_summary": "...",
            "sectional_report": {{
                "keyword_analysis": {{"score": 0, "feedback": "...", "actionable_fix": "..."}},
                "skills_audit": {{"score": 0, "feedback": "...", "missing_skills": [], "priority_skill_to_add": "..."}},
                "experience_logic": {{"score": 0, "relevance_summary": "...", "feedback": "...", "quantification_hack": "..."}},
                "formatting_structure": {{"score": 0, "pattern_detected": "...", "structural_advice": "...", "layout_optimization": "..."}},
                "achievements_impact": {{"score": 0, "feedback": "...", "detected_achievements": [], "impact_multiplier_advice": "..."}},
                "market_benchmarking": {{"score": 0, "percentile": 0, "market_demand": "...", "salary_estimate": "...", "regional_positioning_strategy": "..."}}
            }},
            "market_benchmarking": {{
                "target_market_used": "Match this to the analyzed region",
                "percentile": 0,
                "average_score_for_role": 0,
                "market_demand": "...",
                "salary_estimate": "...",
                "regional_positioning_strategy": "..."
            }},
            "strengths": [],
            "red_flags": [{{ "type": "Area of Weakness", "description": "..." }}],
            "general_career_improvements": [{{ "category": "Improvement Area", "insight": "...", "action_step": "..." }}],
            "suggested_courses": [
                {{"name": "Specific Course Name", "url": "https://www.coursera.org/search?query=..."}}
            ],
            "interview_prep": [
                {{"question": "Q1", "intent": "I1", "suggested_answer": "A1"}}
            ]
        }}
        """
        try:
            print("Attempting evaluation...")
            response = await asyncio.to_thread(model.generate_content, eval_prompt, generation_config=generation_config)
            content = response.text.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].strip()
            return json.loads(content)
        except Exception as e:
            err_msg = str(e)
            print(f"CV Analysis Error: {err_msg}")
            if "quota" in err_msg.lower() or "429" in err_msg:
                return {"candidate_name": "Error: Quota Exceeded", "score": 0, "red_flags": [{"type": "System", "description": "Gemini API quota reached. Please try again in a minute."}], "improvements": []}
            return {"candidate_name": "Error analyzing resume", "score": 0, "red_flags": [], "improvements": []}
