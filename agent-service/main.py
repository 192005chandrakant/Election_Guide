import os
import warnings
import logging
import json
import time
import sys
from datetime import datetime
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

# ─── Structured Logging ───
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

warnings.simplefilter("ignore", FutureWarning)

try:
    import google.generativeai as genai
except ModuleNotFoundError:
    genai = None
    logger.warning("google.generativeai not available")

load_dotenv()

# ─── Health Status Tracking ───
class HealthStatus:
    def __init__(self):
        self.startup_time = datetime.utcnow()
        self.gemini_available = False
        self.db_available = False
        self.last_error = None
        self.error_count = 0
        self.request_count = 0
        
    def reset_startup(self):
        self.startup_time = datetime.utcnow()
        self.error_count = 0
    
    def log_error(self, error: Exception):
        self.last_error = str(error)
        self.error_count += 1
        logger.error(f"Health error: {error}")
    
    def log_request(self):
        self.request_count += 1

health_status = HealthStatus()

# ─── MISSING FUNCTION - Rule-based next steps fallback ───
def get_rule_based_next_steps(req: "NextStepsRequest") -> List[str]:
    """Generate rule-based fallback next steps when Gemini is unavailable."""
    location = req.location.strip() if req.location else "Unknown"
    
    base_steps = [
        "Check your voter registration status on the NVSP portal (nvsp.in)",
        "Verify your polling station and voting location",
        "Prepare your valid photo ID (EPIC, Aadhaar, Passport, etc.)",
    ]
    
    if req.isFirstTimeVoter:
        base_steps = [
            "Apply for voter registration using Form 6 on NVSP or your state ECI portal",
            "Collect proof of age, address, and identity documents",
            "Track your registration application status online",
        ] + base_steps
    
    pending = [k for k, v in req.checklistProgress.items() if not v]
    if pending:
        specific_steps = {
            "registration": "Complete your voter registration on NVSP.in before the deadline",
            "id_ready": "Gather valid photo ID - EPIC, Aadhaar, Passport, or Driving License",
            "polling_location": "Find your assigned polling station on the NVSP voter search tool",
            "voting_plan": "Plan your travel to the polling station and voting time",
        }
        for item in pending:
            if item in specific_steps:
                base_steps.insert(0, specific_steps[item])
                break
    
    return base_steps[:3]


# Initialize Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ENABLE_GEMINI = os.getenv("ENABLE_GEMINI", "false").lower() in {"1", "true", "yes"}

if not GEMINI_API_KEY or genai is None:
    logger.warning("Gemini API Key not set or genai package unavailable. Using fallback responses.")
    health_status.gemini_available = False
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        health_status.gemini_available = True
        logger.info("Gemini API configured successfully")
    except Exception as e:
        logger.error(f"Failed to configure Gemini: {e}")
        health_status.gemini_available = False
        health_status.log_error(e)


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
    health_status.log_request()
    return {
        "status": "running",
        "service": "CivicGuide Agent API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    health_status.log_request()
    uptime_seconds = (datetime.utcnow() - health_status.startup_time).total_seconds()
    
    return {
        "status": "healthy" if not health_status.error_count else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime_seconds": uptime_seconds,
        "gemini_available": health_status.gemini_available,
        "request_count": health_status.request_count,
        "error_count": health_status.error_count,
    }


@app.get("/ready")
async def readiness_check():
    """Cloud Run readiness probe - checks if service is ready to serve."""
    health_status.log_request()
    uptime_seconds = (datetime.utcnow() - health_status.startup_time).total_seconds()
    
    # Give service 5 seconds to fully initialize
    if uptime_seconds < 5:
        logger.warning(f"Service still initializing (uptime: {uptime_seconds}s)")
        return {"ready": False, "reason": "Initializing"}
    
    # Consider ready if no critical errors yet
    ready = health_status.error_count < 5
    
    if not ready:
        logger.error(f"Service not ready: error_count={health_status.error_count}")
        return {"ready": False, "reason": f"Too many errors: {health_status.error_count}"}
    
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat(),
        "gemini": health_status.gemini_available,
    }


@app.get("/live")
async def liveness_check():
    """Cloud Run liveness probe - checks if service process is alive."""
    return {"alive": True}


@app.get("/agents")
async def list_agents():
    return {
        "agents": [agent.model_dump() for agent in AGENT_CATALOG]
    }


@app.post("/chat", response_model=StructuredChatResponse)
async def chat_endpoint(req: ChatRequest):
    """Main chat endpoint with comprehensive error handling."""
    health_status.log_request()
    request_id = f"{int(time.time() * 1000)}-{req.userId[:10]}"
    
    try:
        logger.info(f"[{request_id}] Chat request from user {req.userId}, mode: {req.agentMode}, query length: {len(req.query)}")
        
        if not ENABLE_GEMINI or not health_status.gemini_available or not GEMINI_API_KEY or genai is None:
            logger.warning(f"[{request_id}] Gemini disabled or unavailable, using fallback")
            fallback_response = build_fallback_chat_response(req, get_agent_by_mode(req.agentMode), "Gemini disabled or unavailable")
            fallback_response.source = "fallback"
            return fallback_response

        # Prefer supported flash models and allow overrides via environment variables.
        models_to_try = get_gemini_model_candidates()
        if not models_to_try:
            logger.error(f"[{request_id}] No allowed Gemini models configured")
            return build_fallback_chat_response(req, get_agent_by_mode(req.agentMode), "No allowed Gemini models configured")
        
        last_error = None
        agent = get_agent_by_mode(req.agentMode)

        for attempt, model_name in enumerate(models_to_try, 1):
            try:
                logger.info(f"[{request_id}] Attempting chat with model {model_name} (attempt {attempt}/{len(models_to_try)})")
                
                system_prompt = get_chat_system_prompt(req)
                history = get_chat_history(req.userId)
                
                # Configure model with timeout
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
                
                # Send message with error handling
                response = chat.send_message(req.query)
                
                raw_text = response.text.strip()
                logger.debug(f"[{request_id}] Raw response length: {len(raw_text)}")
                
                # Robust JSON cleaning
                if "{" in raw_text:
                    start_idx = raw_text.find("{")
                    end_idx = raw_text.rfind("}") + 1
                    raw_text = raw_text[start_idx:end_idx]
                
                try:
                    data = json.loads(raw_text)
                    logger.info(f"[{request_id}] Successfully parsed response from model {model_name}")
                    
                    # Validate required fields
                    required_fields = ["summary", "answer", "keyPoints", "nextSteps", "followUpQuestions", "actionSuggestions", "trust", "disclaimer", "speechText"]
                    for field in required_fields:
                        if field not in data:
                            data[field] = None
                    
                except json.JSONDecodeError as je:
                    logger.warning(f"[{request_id}] JSON Decode failed for {model_name}: {je}. Wrapping response.")
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
                
                try:
                    save_chat_interaction(req.userId, req.query, data.get("answer", response.text))
                except Exception as save_err:
                    logger.error(f"[{request_id}] Error saving chat interaction: {save_err}")
                
                logger.info(f"[{request_id}] Chat completed successfully with {model_name}")
                return StructuredChatResponse(**data, source=f"gemini:{model_name}:{agent.id}")

            except Exception as e:
                error_msg = f"{type(e).__name__}: {str(e)}"
                logger.error(f"[{request_id}] Model {model_name} failed: {error_msg}")
                health_status.log_error(e)
                last_error = e
                continue

        # If all models fail, return a structured fallback instead of a 500.
        logger.error(f"[{request_id}] All models failed! Last error: {last_error}")
        fallback = build_fallback_chat_response(
            req,
            agent,
            f"Gemini fallback used after model errors: {last_error}",
        )
        return fallback

    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in chat endpoint: {e}", exc_info=True)
        health_status.log_error(e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/notify")
async def send_push_notification(req: PushNotificationRequest):
    """Trigger a push notification to a specific user's device via FCM."""
    health_status.log_request()
    request_id = f"{int(time.time() * 1000)}-{req.userId[:10]}"
    
    try:
        logger.info(f"[{request_id}] Notification request for user {req.userId}")
        
        token = get_user_fcm_token(req.userId)
        if not token:
            logger.warning(f"[{request_id}] User {req.userId} has no FCM token")
            return {"error": "User does not have an FCM token registered.", "success": False}
        
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
            logger.info(f"[{request_id}] Notification sent successfully: {response}")
            return {"success": True, "message_id": response}
        except Exception as e:
            logger.error(f"[{request_id}] Error sending notification: {e}")
            health_status.log_error(e)
            return {"error": str(e), "success": False}
    
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in notification: {e}", exc_info=True)
        health_status.log_error(e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_endpoint(req: SummarizeRequest):
    """Summarize election-related text in simple language."""
    health_status.log_request()
    request_id = f"{int(time.time() * 1000)}-{hash(req.text) % 10000}"
    
    try:
        logger.info(f"[{request_id}] Summarize request, text length: {len(req.text)}")
        
        if not ENABLE_GEMINI or not health_status.gemini_available or not GEMINI_API_KEY or genai is None:
            logger.warning(f"[{request_id}] Gemini unavailable, using fallback")
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
                logger.info(f"[{request_id}] Trying model {model_name} for summarization")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                logger.info(f"[{request_id}] Summarize successful with {model_name}")
                return SummarizeResponse(summary=response.text)
            except Exception as e:
                logger.error(f"[{request_id}] Summarize error (model={model_name}): {e}")
                health_status.log_error(e)
                last_error = e

        logger.error(f"[{request_id}] All summarize models failed. Last error: {last_error}")
        fallback_summary = req.text.strip().split(".")[0].strip() or "Summary unavailable. Please verify with official election sources."
        return SummarizeResponse(summary=fallback_summary)
    
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in summarize: {e}", exc_info=True)
        health_status.log_error(e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/analyze-candidates", response_model=CandidateAnalysisResponse)
async def analyze_candidates(req: CandidateAnalysisRequest):
    """Analyze and compare candidates on specified issues."""
    health_status.log_request()
    request_id = f"{int(time.time() * 1000)}-{hash(','.join(req.candidateNames)) % 10000}"
    
    try:
        logger.info(f"[{request_id}] Candidate analysis for: {', '.join(req.candidateNames)}")
        
        issues_str = ", ".join(req.issues)
        fallback_analysis = (
            f"Gemini was unavailable, so compare {', '.join(req.candidateNames)} using official manifestos, affidavits, and ECI records. "
            f"Focus on these issues: {issues_str or 'your priority issues'}. Always verify facts from official sources before deciding."
        )

        if not ENABLE_GEMINI or not health_status.gemini_available or not GEMINI_API_KEY or genai is None:
            logger.warning(f"[{request_id}] Gemini unavailable, using fallback")
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
            logger.warning(f"[{request_id}] No models available for candidate analysis")
            return CandidateAnalysisResponse(analysis=fallback_analysis)

        last_error = None
        for model_name in models_to_try:
            try:
                logger.info(f"[{request_id}] Analyzing candidates with {model_name}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                logger.info(f"[{request_id}] Candidate analysis successful with {model_name}")
                return CandidateAnalysisResponse(analysis=response.text)
            except Exception as e:
                logger.error(f"[{request_id}] Candidate analysis error (model={model_name}): {e}")
                health_status.log_error(e)
                last_error = e

        logger.error(f"[{request_id}] All candidate analysis models failed")
        return CandidateAnalysisResponse(analysis=fallback_analysis)
    
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in candidate analysis: {e}", exc_info=True)
        health_status.log_error(e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/next-steps", response_model=NextStepsResponse)
async def next_steps(req: NextStepsRequest):
    """Generate top personalized next actions to improve voter readiness."""
    health_status.log_request()
    request_id = f"{int(time.time() * 1000)}-{req.userId[:10]}"
    
    try:
        logger.info(f"[{request_id}] Next steps request from user {req.userId}")
        
        fallback_steps = get_rule_based_next_steps(req)

        if not ENABLE_GEMINI or not health_status.gemini_available or not GEMINI_API_KEY or genai is None:
            logger.warning(f"[{request_id}] Gemini unavailable, using rule-based steps")
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
            logger.warning(f"[{request_id}] No models available for next steps")
            return NextStepsResponse(steps=fallback_steps, source="fallback")

        for model_name in models_to_try:
            try:
                logger.info(f"[{request_id}] Generating next steps with {model_name}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                lines = [line.strip("-• \t") for line in response.text.splitlines() if line.strip()]
                steps = [line for line in lines if len(line) > 3][:3]

                if not steps:
                    logger.warning(f"[{request_id}] No valid steps from {model_name}, trying next")
                    continue

                while len(steps) < 3:
                    steps.append(fallback_steps[len(steps)])

                logger.info(f"[{request_id}] Next steps generated successfully with {model_name}")
                return NextStepsResponse(steps=steps[:3], source=f"gemini:{model_name}")
            except Exception as e:
                logger.error(f"[{request_id}] Next steps generation error (model={model_name}): {e}")
                health_status.log_error(e)

        logger.warning(f"[{request_id}] All models failed for next steps, using fallback")
        return NextStepsResponse(steps=fallback_steps, source="fallback")
    
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in next steps: {e}", exc_info=True)
        health_status.log_error(e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")





# ─── Startup and Shutdown Events ───
@app.on_event("startup")
async def startup_event():
    """Initialize service on startup."""
    logger.info("=== CivicGuide Agent Service Starting ===")
    logger.info(f"Gemini configured: {health_status.gemini_available}")
    logger.info(f"Allowed origins: {get_allowed_origins()}")
    logger.info(f"Allowed models: {get_allowed_gemini_models()}")
    logger.info("=== Service Startup Complete ===")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("=== CivicGuide Agent Service Shutting Down ===")
    logger.info(f"Total requests: {health_status.request_count}")
    logger.info(f"Total errors: {health_status.error_count}")
    logger.info("=== Service Shutdown Complete ===")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting Uvicorn server on port {port}")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
