import os
import warnings
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from db import get_chat_history, save_chat_interaction, get_user_fcm_token
from tools import (
    agent_tools,
    get_eci_helpline,
    get_valid_voter_ids_india,
)

warnings.simplefilter("ignore", FutureWarning)

try:
    import google.generativeai as genai
except ModuleNotFoundError:
    genai = None

load_dotenv()

# Initialize Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ENABLE_GEMINI = os.getenv("ENABLE_GEMINI", "false").lower() in {"1", "true", "yes"}
if not GEMINI_API_KEY or genai is None:
    print("Warning: GEMINI_API_KEY not set. Using fallback responses.")
else:
    genai.configure(api_key=GEMINI_API_KEY)


DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://civicguide-web-220048333239.us-central1.run.app",
]


def get_allowed_origins() -> list[str]:
    raw_origins = os.getenv("ALLOWED_ORIGINS") or os.getenv("ALLOWED_ORIGIN")
    if raw_origins:
        origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    else:
        origins = DEFAULT_ALLOWED_ORIGINS[:]

    unique_origins: list[str] = []
    for origin in origins:
        if origin not in unique_origins:
            unique_origins.append(origin)
    return unique_origins


DEFAULT_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite")


DEFAULT_MODEL_PREFERENCE: list[str] = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-lite-001",
    "gemini-flash-lite-latest",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
]


DEFAULT_ALLOWED_GEMINI_MODELS: list[str] = DEFAULT_MODEL_PREFERENCE[:]


def normalize_gemini_model_name(model_name: str) -> str:
    cleaned = (model_name or "").strip()
    if cleaned.startswith("models/"):
        cleaned = cleaned[len("models/") :]
    return cleaned


def get_allowed_gemini_models() -> set[str]:
    raw_allowed = os.getenv("ALLOWED_GEMINI_MODELS")
    if raw_allowed:
        allowed = {
            normalize_gemini_model_name(model)
            for model in raw_allowed.split(",")
            if normalize_gemini_model_name(model)
        }
        return allowed
    return set(DEFAULT_ALLOWED_GEMINI_MODELS)


def get_gemini_model_candidates() -> list[str]:
    allowed = get_allowed_gemini_models()
    raw_models = os.getenv("GEMINI_MODELS")
    if raw_models:
        candidates = [
            normalize_gemini_model_name(model)
            for model in raw_models.split(",")
            if normalize_gemini_model_name(model)
        ]
    else:
        candidates = [DEFAULT_GEMINI_MODEL, *DEFAULT_MODEL_PREFERENCE]

    unique_candidates: list[str] = []
    for model_name in candidates:
        normalized = normalize_gemini_model_name(model_name)
        if not normalized:
            continue
        if allowed and normalized not in allowed:
            continue
        if normalized not in unique_candidates:
            unique_candidates.append(normalized)
    return unique_candidates


def summarize_error_reason(reason: str) -> str:
    compact = " ".join(str(reason).split())
    if len(compact) <= 220:
        return compact
    return f"{compact[:217]}..."


def build_fallback_chat_response(req: "ChatRequest", agent: "AgentInfo", reason: str) -> "StructuredChatResponse":
    query = req.query.lower()
    voter_id_copy = get_valid_voter_ids_india()
    helpline_copy = get_eci_helpline()

    if any(keyword in query for keyword in ["voter id", "epic", "form 6", "register", "apply"]):
        answer = (
            "To apply for a Voter ID card (EPIC) in India, start with Form 6 on the ECI or NVSP voter services portal. "
            "Keep your proof of age, proof of address, and a photo identity document ready. "
            "After submission, track the application and respond to any verification request from the electoral office."
        )
        summary = "Use Form 6 on the ECI or NVSP portal to apply for EPIC and keep your documents ready."
        key_points = [
            "Apply through the ECI/NVSP voter services portal using Form 6.",
            "Prepare proof of age, address, and a valid photo ID.",
            "Track the application and complete local verification if requested.",
        ]
        next_steps = [
            "Open the ECI or NVSP voter services portal and start Form 6.",
            "Gather your ID, address proof, and age proof before submitting.",
            "Use Voter Helpline 1950 if you need help with the application.",
        ]
        follow_up_questions = [
            "Which state or constituency are you applying from?",
            "Do you want the online Form 6 steps or offline office steps?",
            "Do you need a list of acceptable documents?",
        ]
        action_suggestions = [
            ActionSuggestion(label="See valid IDs", query="What documents are valid for voter ID application in India?"),
            ActionSuggestion(label="Check deadlines", query="What is the voter registration deadline for my state?"),
        ]
        speech_text = (
            "Apply using Form 6 on the ECI or NVSP portal. Keep your age, address, and photo ID documents ready, then track your application."
        )
    else:
        answer = (
            "I could not reach Gemini, so I am using official election guidance instead. "
            f"{helpline_copy} {voter_id_copy}"
        )
        summary = "Gemini was unavailable, so the response is based on official ECI guidance."
        key_points = [
            "Check your voter registration status on the ECI/NVSP portal.",
            "Keep a valid photo ID and your polling details ready.",
            "Call 1950 for official voter help if needed.",
        ]
        next_steps = [
            "Visit the ECI voter services portal to verify your details.",
            "Keep your EPIC or Aadhaar ready for voting day.",
            "Confirm your polling station before Election Day.",
        ]
        follow_up_questions = [
            "Do you want help with registration, polling place, or IDs?",
            "Which state or city should I use for guidance?",
            "Do you want a simple checklist for voting day?",
        ]
        action_suggestions = [
            ActionSuggestion(label="View voter IDs", query="What IDs are valid for voting in India?"),
            ActionSuggestion(label="Find polling place", query="How do I find my polling station?"),
        ]
        speech_text = "I can still help with official election guidance. Ask me about registration, valid IDs, or polling places."

    return StructuredChatResponse(
        summary=summary,
        answer=answer,
        keyPoints=key_points,
        nextSteps=next_steps,
        followUpQuestions=follow_up_questions,
        actionSuggestions=action_suggestions,
        trust=TrustInfo(
            source="official",
            confidence="high",
            note=f"Fallback response used because Gemini was unavailable. {summarize_error_reason(reason)}",
        ),
        disclaimer="Verify final details with the ECI or NVSP portal before taking action.",
        speechText=speech_text,
        source=f"fallback:{agent.id}",
    )

app = FastAPI(
    title="CivicGuide Agent API",
    description="AI-powered election assistant backend powered by Gemini",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───

class ChatRequest(BaseModel):
    query: str
    userId: str
    location: str = "Unknown"
    isFirstTimeVoter: bool = False
    language: str = "en"
    simpleMode: bool = False
    agentMode: str = "guide"


class ActionSuggestion(BaseModel):
    label: str
    query: str

class TrustInfo(BaseModel):
    source: str
    confidence: str
    note: str

class StructuredChatResponse(BaseModel):
    summary: str
    answer: str
    keyPoints: List[str]
    nextSteps: List[str]
    followUpQuestions: List[str]
    actionSuggestions: List[ActionSuggestion]
    trust: TrustInfo
    disclaimer: str
    speechText: str
    source: str = "gemini"


class PushNotificationRequest(BaseModel):
    userId: str
    title: str
    body: str
    data: Optional[Dict[str, str]] = None


class AgentInfo(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    promptFocus: str
    systemRole: str


AGENT_CATALOG = [
    AgentInfo(
        id="guide",
        title="Voter Guide Agent",
        description="Explains ECI registration, valid IDs, voting deadlines, and step-by-step voting process.",
        icon="book-open",
        promptFocus="Provide practical, context-aware Indian election guidance in plain language.",
        systemRole="Concise non-partisan Indian election guide",
    ),
    AgentInfo(
        id="readiness",
        title="Voter Readiness Engine",
        description="Tracks voter preparation progress and recommends next actions to ensure readiness.",
        icon="radar",
        promptFocus="Identify voter readiness gaps and recommend the most critical next step.",
        systemRole="Voter preparation strategist",
    ),
    AgentInfo(
        id="booth",
        title="Polling Station Finder",
        description="Helps locate assigned polling station, plan transport, and prepare for voting day.",
        icon="map-pin",
        promptFocus="Help users find their polling station and plan logistics to get there.",
        systemRole="Polling station and logistics guide",
    ),
    AgentInfo(
        id="candidate",
        title="Candidate Comparison Agent",
        description="Provides neutral issue-by-issue candidate and party comparisons without endorsements.",
        icon="users",
        promptFocus="Compare candidates and parties on key issues neutrally and objectively.",
        systemRole="Neutral candidate and party research analyst",
    ),
    AgentInfo(
        id="plan",
        title="Voter Readiness Coach",
        description="Creates personalized next steps and motivation to complete voter preparation checklist.",
        icon="sparkles",
        promptFocus="Create short action steps and encouragement for the user.",
        systemRole="Voter motivation and action-planning coach",
    ),
    AgentInfo(
        id="trust",
        title="Trust & Verification Agent",
        description="Labels source quality, identifies fallback data, and suggests official verification steps.",
        icon="shield-check",
        promptFocus="Explain confidence, source quality, and what should be verified officially.",
        systemRole="Election information verification and credibility specialist",
    ),
    AgentInfo(
        id="accessibility",
        title="Accessibility Agent",
        description="Simplifies language, supports voice-ready answers, and guides voters with access needs.",
        icon="accessibility",
        promptFocus="Make election guidance inclusive, simple, and accessible.",
        systemRole="Accessible and inclusive civic guidance specialist",
    ),
    AgentInfo(
        id="offline",
        title="Offline Kit Agent",
        description="Builds printable and offline voting checklists, document reminders, and election-day kits.",
        icon="wifi-off",
        promptFocus="Prepare low-connectivity and printable voting-day resources.",
        systemRole="Offline election preparation and kit planner",
    ),
    AgentInfo(
        id="reminder",
        title="Smart Reminder Agent",
        description="Creates timely nudges for deadlines, booth checks, ID prep, and voting-day planning.",
        icon="bell",
        promptFocus="Create timely, respectful reminders that increase completion without overwhelming users.",
        systemRole="Voter engagement and reminder coach",
    ),
]


class SummarizeRequest(BaseModel):
    text: str
    language: str = "en"
    simpleMode: bool = False


class SummarizeResponse(BaseModel):
    summary: str


class CandidateAnalysisRequest(BaseModel):
    candidateNames: List[str]
    issues: List[str]
    location: str = "Unknown"


class CandidateAnalysisResponse(BaseModel):
    analysis: str


class NextStepsRequest(BaseModel):
    userId: str = "anonymous"
    location: str = "Unknown"
    isFirstTimeVoter: bool = False
    language: str = "en"
    simpleMode: bool = False
    checklistProgress: Dict[str, bool] = {}


class NextStepsResponse(BaseModel):
    steps: List[str]
    source: str = "rules"


# ─── System Prompts ───

AGENT_MODE_PROMPT_RULES: Dict[str, str] = {
    "guide": """Mode goals:
- Give step-by-step election process guidance (registration, IDs, voting-day flow).
- Prefer practical checklists over abstract explanation.
- Highlight deadlines and sequence clearly.
Mode style:
- Use compact headings and short bullets.
- Always include at least one official next action (ECI/NVSP/1950).""",
    "readiness": """Mode goals:
- Diagnose what the user is missing to be vote-ready.
- Prioritize one most important action first, then supporting actions.
- Explain why each step matters for readiness.
Mode style:
- Use a gap -> impact -> action framing.
- Keep next steps measurable and time-bound when possible.""",
    "booth": """Mode goals:
- Help the user locate polling station information and plan travel logistics.
- Anticipate voting-day friction points (distance, timing, queue, documents).
- Provide backup options if location details are uncertain.
Mode style:
- Include a concise route/logistics plan.
- Emphasize what to verify before leaving home.""",
    "candidate": """Mode goals:
- Compare candidates and parties factually without endorsement.
- Focus on issues, evidence, and tradeoffs.
- Flag missing or uncertain data explicitly.
Mode style:
- Use side-by-side criteria bullets when possible.
- Avoid persuasive political language.""",
    "plan": """Mode goals:
- Convert advice into a short, motivating action plan.
- Keep momentum high with low-friction, immediate tasks.
- Adapt plan intensity based on first-time voter and user context.
Mode style:
- Present a now/next/later structure.
- Use encouraging but non-patronizing language.""",
    "trust": """Mode goals:
- Evaluate reliability of information and distinguish official vs non-official sources.
- Explain confidence level and verification path.
- Minimize hallucination risk by acknowledging uncertainty.
Mode style:
- Be explicit about evidence quality.
- Include a verification checklist and trusted source hierarchy.""",
    "accessibility": """Mode goals:
- Make content easier to understand and act on for diverse accessibility needs.
- Reduce cognitive load and jargon.
- Offer alternatives for low literacy, low vision, or voice-first usage.
Mode style:
- Use very short sentences and plain words.
- Keep steps linear and unambiguous.""",
    "offline": """Mode goals:
- Produce low-connectivity plans and printable resource kits.
- Prioritize information users can save or carry offline.
- Suggest pre-download and paper backup strategies.
Mode style:
- Use checklist format optimized for printing.
- Highlight what must be prepared before network loss.""",
    "reminder": """Mode goals:
- Generate reminder sequences for key election milestones.
- Balance urgency with respectful tone to avoid alert fatigue.
- Tie reminders to concrete outcomes.
Mode style:
- Suggest cadence (e.g., 7d/3d/1d/day-of).
- Keep reminder copy short, action-first, and specific.""",
}


def get_agent_mode_prompt(mode: str) -> str:
    return AGENT_MODE_PROMPT_RULES.get(mode, AGENT_MODE_PROMPT_RULES["guide"])

def get_chat_system_prompt(req: ChatRequest) -> str:
    agent = get_agent_by_mode(req.agentMode)

    language_instruction = ""
    if req.language != "en":
        lang_map = {
            "es": "Spanish",
            "hi": "Hindi",
            "zh": "Chinese",
            "fr": "French",
            "ar": "Arabic",
            "bn": "Bengali",
            "ta": "Tamil",
            "te": "Telugu",
            "mr": "Marathi",
            "gu": "Gujarati",
            "kn": "Kannada",
            "ml": "Malayalam",
            "pa": "Punjabi",
            "ur": "Urdu",
            "or": "Odia",
        }
        lang_name = lang_map.get(req.language, "English")
        language_instruction = f"\nIMPORTANT: Respond in {lang_name}."

    simple_instruction = ""
    if req.simpleMode:
        simple_instruction = (
            "\nIMPORTANT: Use plain language for a 15-year-old reader. "
            "Prefer short sentences, concrete examples, and one idea per bullet."
        )

    location_context = req.location.strip() if req.location and req.location.strip() else "Unknown"
    mode_prompt = get_agent_mode_prompt(agent.id)

    return f"""You are CivicGuide, a highly helpful, engaging, and personalized election assistant for Indian elections.
Primary role: {agent.systemRole}
Primary focus: {agent.promptFocus}

Mode-specific behavior:
{mode_prompt}

User Context:
- Location: {location_context}
- First Time Voter: {'Yes' if req.isFirstTimeVoter else 'No'}
- Language: {req.language}
- Agent Mode: {agent.id}

Guidelines:
1. Provide accurate, concise, and non-partisan voting information.
2. Tailor advice to the user's location when location context is available.
3. Be encouraging and supportive.
4. If unsure about specific local regulations, recommend checking official ECI (Election Commission of India) resources.
5. Use tools to verify exact deadlines, polling details, and candidate facts whenever the user asks for specific or local data.
6. Do not invent facts. If uncertain, state uncertainty and provide the safest verification path.
7. Keep the final answer in valid Markdown inside the JSON fields where text is expected.
{language_instruction}{simple_instruction}

Return ONLY valid JSON with this exact shape:
{{
  "summary": "short 1-2 sentence summary",
  "answer": "polished Markdown answer with headings and bullet points",
  "keyPoints": ["3-5 concise bullets"],
  "nextSteps": ["2-4 immediate actions"],
  "followUpQuestions": ["3 helpful follow-up questions"],
  "actionSuggestions": [{{"label": "button label", "query": "short follow-up prompt"}}],
  "trust": {{"source": "official|mixed|fallback", "confidence": "high|medium|low", "note": "brief trust note"}},
  "disclaimer": "brief verification note",
  "speechText": "a concise spoken version of the answer"
}}"""


def get_agent_by_mode(mode: str) -> AgentInfo:
    for agent in AGENT_CATALOG:
        if agent.id == mode:
            return agent
    return AGENT_CATALOG[0]


# ─── Endpoints ───

@app.get("/")
async def root():
    return {"status": "running", "service": "CivicGuide Agent API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": GEMINI_API_KEY is not None and genai is not None,
    }


@app.get("/agents")
async def list_agents():
    return {
        "agents": [agent.model_dump() for agent in AGENT_CATALOG]
    }


@app.post("/chat", response_model=StructuredChatResponse)
async def chat_endpoint(req: ChatRequest):
    if not ENABLE_GEMINI or not GEMINI_API_KEY or genai is None:
        return build_fallback_chat_response(req, get_agent_by_mode(req.agentMode), "Gemini disabled or unavailable")

    # Prefer supported flash models and allow overrides via environment variables.
    models_to_try = get_gemini_model_candidates()
    if not models_to_try:
        return build_fallback_chat_response(req, get_agent_by_mode(req.agentMode), "No allowed Gemini models configured")
    last_error = None

    for model_name in models_to_try:
        try:
            print(f"DIAGNOSTIC: Attempting chat with model: {model_name}")
            agent = get_agent_by_mode(req.agentMode)
            system_prompt = get_chat_system_prompt(req)
            history = get_chat_history(req.userId)
            
            # Configure model
            model = genai.GenerativeModel(
                model_name,
                tools=agent_tools,
                system_instruction=system_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            chat = model.start_chat(
                history=history,
                enable_automatic_function_calling=True
            )
            
            response = chat.send_message(req.query)
            
            import json
            raw_text = response.text.strip()
            # Robust JSON cleaning
            if "{" in raw_text:
                start_idx = raw_text.find("{")
                end_idx = raw_text.rfind("}") + 1
                raw_text = raw_text[start_idx:end_idx]
            
            try:
                data = json.loads(raw_text)
                print(f"SUCCESS: Model {model_name} responded correctly.")
            except json.JSONDecodeError:
                print(f"WARNING: JSON Decode failed for {model_name}. Attempting to wrap raw text.")
                data = {
                    "summary": "Generated a response but had trouble formatting it.",
                    "answer": response.text,
                    "keyPoints": [],
                    "nextSteps": [],
                    "followUpQuestions": [],
                    "actionSuggestions": [],
                    "trust": {"source": "mixed", "confidence": "medium", "note": "Format error"},
                    "disclaimer": "Automated response.",
                    "speechText": "I have provided an answer below."
                }
            
            save_chat_interaction(req.userId, req.query, data.get("answer", response.text))
            return StructuredChatResponse(**data, source=f"gemini:{model_name}:{agent.id}")

        except Exception as e:
            print(f"ERROR: Model {model_name} failed. Error type: {type(e).__name__}. Message: {str(e)}")
            last_error = e
            continue

    # If all models fail, return a structured fallback instead of a 500.
    print(f"CRITICAL: All models failed! Last error: {str(last_error)}")
    return build_fallback_chat_response(
        req,
        get_agent_by_mode(req.agentMode),
        f"Gemini fallback used after model errors: {last_error}",
    )


@app.post("/notify")
async def send_push_notification(req: PushNotificationRequest):
    """Trigger a push notification to a specific user's device via FCM."""
    token = get_user_fcm_token(req.userId)
    if not token:
        return {"error": "User does not have an FCM token registered."}
        
    try:
        from firebase_admin import messaging
        message = messaging.Message(
            notification=messaging.Notification(
                title=req.title,
                body=req.body,
            ),
            data=req.data or {},
            token=token,
        )
        response = messaging.send(message)
        return {"success": True, "message_id": response}
    except Exception as e:
        print(f"Error sending push notification: {e}")
        return {"error": str(e)}


@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_endpoint(req: SummarizeRequest):
    """Summarize election-related text in simple language."""
    if not ENABLE_GEMINI or not GEMINI_API_KEY or genai is None:
        fallback_summary = req.text.strip().split(".")[0].strip() or "Summary unavailable. Please verify with official election sources."
        return SummarizeResponse(summary=fallback_summary)

    style = "for a 15-year-old using simple words and short sentences" if req.simpleMode else "clearly and concisely"
    prompt = f"Summarize the following election-related text {style}:\n\n{req.text}"

    models_to_try = get_gemini_model_candidates()
    if not models_to_try:
        fallback_summary = req.text.strip().split(".")[0].strip() or "Summary unavailable. Please verify with official election sources."
        return SummarizeResponse(summary=fallback_summary)

    last_error = None
    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            return SummarizeResponse(summary=response.text)
        except Exception as e:
            print(f"Summarize error (model={model_name}): {e}")
            last_error = e

    fallback_summary = req.text.strip().split(".")[0].strip() or "Summary unavailable. Please verify with official election sources."
    return SummarizeResponse(summary=fallback_summary)


@app.post("/analyze-candidates", response_model=CandidateAnalysisResponse)
async def analyze_candidates(req: CandidateAnalysisRequest):
    """Analyze and compare candidates on specified issues."""
    issues_str = ", ".join(req.issues)

    fallback_analysis = (
        f"Gemini was unavailable, so compare {', '.join(req.candidateNames)} using official manifestos, affidavits, and ECI records. "
        f"Focus on these issues: {issues_str or 'your priority issues'}. Always verify facts from official sources before deciding."
    )

    if not ENABLE_GEMINI or not GEMINI_API_KEY or genai is None:
        return CandidateAnalysisResponse(analysis=fallback_analysis)

    candidates_str = ", ".join(req.candidateNames)
    prompt = f"""Provide a brief, non-partisan comparison of the following Indian election candidates: {candidates_str}
        
Compare them on these issues: {issues_str}
Location context: {req.location}

Format as a clear, bullet-pointed comparison that helps Indian voters understand the differences.
Use Indian election context: refer to constituencies, ECI rules, party manifestos.
Keep it factual and balanced."""

    models_to_try = get_gemini_model_candidates()
    if not models_to_try:
        return CandidateAnalysisResponse(analysis=fallback_analysis)

    last_error = None
    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            return CandidateAnalysisResponse(analysis=response.text)
        except Exception as e:
            print(f"Candidate analysis error (model={model_name}): {e}")
            last_error = e

    return CandidateAnalysisResponse(analysis=fallback_analysis)


@app.post("/next-steps", response_model=NextStepsResponse)
async def next_steps(req: NextStepsRequest):
    """Generate top personalized next actions to improve voter readiness."""
    fallback_steps = get_rule_based_next_steps(req)

    if not ENABLE_GEMINI or not GEMINI_API_KEY or genai is None:
        return NextStepsResponse(steps=fallback_steps, source="fallback")

    pending_items = [key for key, value in req.checklistProgress.items() if not value]
    simple_hint = (
        "Use very simple words and short sentences suitable for a teenager."
        if req.simpleMode
        else "Use plain, concise language."
    )

    prompt = f"""You are a non-partisan election readiness coach.
Generate exactly 3 short next-action steps for this user.

User context:
- Location: {req.location}
- First-time voter: {req.isFirstTimeVoter}
- Language code: {req.language}
- Pending checklist items: {', '.join(pending_items) if pending_items else 'none'}

Requirements:
- {simple_hint}
- Keep each step under 20 words.
- Focus on practical actions for the next 7 days.
- Return only 3 lines, one step per line, no numbering, no markdown.
"""

    models_to_try = get_gemini_model_candidates()
    if not models_to_try:
        return NextStepsResponse(steps=fallback_steps, source="fallback")

    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            lines = [line.strip("-• \t") for line in response.text.splitlines() if line.strip()]
            steps = [line for line in lines if len(line) > 3][:3]

            if not steps:
                continue

            while len(steps) < 3:
                steps.append(fallback_steps[len(steps)])

            return NextStepsResponse(steps=steps[:3], source=f"gemini:{model_name}")
        except Exception as e:
            print(f"Next steps generation error (model={model_name}): {e}")

    return NextStepsResponse(steps=fallback_steps, source="fallback")





if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
