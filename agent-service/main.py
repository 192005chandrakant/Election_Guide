import os
import warnings
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from db import get_chat_history, save_chat_interaction, get_user_fcm_token
from tools import agent_tools

warnings.simplefilter("ignore", FutureWarning)

try:
    import google.generativeai as genai
except ModuleNotFoundError:
    genai = None

load_dotenv()

# Initialize Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY or genai is None:
    print("Warning: GEMINI_API_KEY not set. Using fallback responses.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(
    title="CivicGuide Agent API",
    description="AI-powered election assistant backend powered by Gemini",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


AGENT_CATALOG = [
    AgentInfo(
        id="guide",
        title="Voter Guide Agent",
        description="Explains ECI registration, valid IDs, voting deadlines, and step-by-step voting process.",
        icon="book-open",
        promptFocus="Provide practical, context-aware Indian election guidance in plain language.",
    ),
    AgentInfo(
        id="readiness",
        title="Voter Readiness Engine",
        description="Tracks voter preparation progress and recommends next actions to ensure readiness.",
        icon="radar",
        promptFocus="Identify voter readiness gaps and recommend the most critical next step.",
    ),
    AgentInfo(
        id="booth",
        title="Polling Station Finder",
        description="Helps locate assigned polling station, plan transport, and prepare for voting day.",
        icon="map-pin",
        promptFocus="Help users find their polling station and plan logistics to get there.",
    ),
    AgentInfo(
        id="candidate",
        title="Candidate Comparison Agent",
        description="Provides neutral issue-by-issue candidate and party comparisons without endorsements.",
        icon="users",
        promptFocus="Compare candidates and parties on key issues neutrally and objectively.",
    ),
    AgentInfo(
        id="plan",
        title="Voter Readiness Coach",
        description="Creates personalized next steps and motivation to complete voter preparation checklist.",
        icon="sparkles",
        promptFocus="Create short action steps and encouragement for the user.",
    ),
    AgentInfo(
        id="trust",
        title="Trust & Verification Agent",
        description="Labels source quality, identifies fallback data, and suggests official verification steps.",
        icon="shield-check",
        promptFocus="Explain confidence, source quality, and what should be verified officially.",
    ),
    AgentInfo(
        id="accessibility",
        title="Accessibility Agent",
        description="Simplifies language, supports voice-ready answers, and guides voters with access needs.",
        icon="accessibility",
        promptFocus="Make election guidance inclusive, simple, and accessible.",
    ),
    AgentInfo(
        id="offline",
        title="Offline Kit Agent",
        description="Builds printable and offline voting checklists, document reminders, and election-day kits.",
        icon="wifi-off",
        promptFocus="Prepare low-connectivity and printable voting-day resources.",
    ),
    AgentInfo(
        id="reminder",
        title="Smart Reminder Agent",
        description="Creates timely nudges for deadlines, booth checks, ID prep, and voting-day planning.",
        icon="bell",
        promptFocus="Create timely, respectful reminders that increase completion without overwhelming users.",
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

def get_chat_system_prompt(req: ChatRequest) -> str:
    language_instruction = ""
    if req.language != "en":
        lang_map = {"es": "Spanish", "hi": "Hindi", "zh": "Chinese", "fr": "French", "ar": "Arabic"}
        lang_name = lang_map.get(req.language, "English")
        language_instruction = f"\nIMPORTANT: Respond in {lang_name}."

    simple_instruction = ""
    if req.simpleMode:
        simple_instruction = "\nIMPORTANT: Explain everything as if you're talking to a 15-year-old. Use simple words, short sentences, and relatable analogies."

    agent_prompts = {
        "guide": "You are a concise civic guide focused on helping the user understand voting steps.",
        "booth": "You are a polling-place concierge focused on logistics, directions, and polling-place prep.",
        "candidate": "You are a neutral candidate comparison assistant focused on facts, tradeoffs, and issues.",
        "plan": "You are a readiness coach focused on motivation, next steps, and checklist completion.",
        "readiness": "You are a readiness engine focused on diagnosing gaps and recommending the next best action.",
        "trust": "You are a verification specialist focused on source quality, uncertainty, and official confirmation.",
        "accessibility": "You are an accessibility guide focused on simple, voice-ready, inclusive election help.",
        "offline": "You are an offline election kit planner focused on printable and low-connectivity resources.",
        "reminder": "You are a smart reminder coach focused on timely nudges that improve completion without overwhelm.",
    }

    agent_intro = agent_prompts.get(req.agentMode, agent_prompts["guide"])

    return f"""You are CivicGuide, a highly helpful, engaging, and personalized election assistant for Indian elections.
{agent_intro}

User Context:
- Location: {req.location}
- First Time Voter: {'Yes' if req.isFirstTimeVoter else 'No'}
- Language: {req.language}
- Agent Mode: {req.agentMode}

Guidelines:
1. Provide accurate, concise, and non-partisan voting information.
2. Tailor your advice specifically to {req.location} if relevant.
3. Be encouraging and supportive.
4. If unsure about specific local regulations, recommend checking official ECI (Election Commission of India) resources.
5. You have access to tools. Use them to look up exact deadlines, polling locations, or candidate info when asked.
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
    if not GEMINI_API_KEY:
        print("CRITICAL: GEMINI_API_KEY is missing from environment!")
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured")

    if genai is None:
        print("CRITICAL: google-generativeai package is NOT installed or failed to import!")
        raise HTTPException(status_code=500, detail="Google Generative AI SDK is not installed on the server.")

    # List of models to try in order of robustness for the user's specific key
    models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-flash-latest", "gemini-pro"]
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

    # If all models fail
    print(f"CRITICAL: All models failed! Last error: {str(last_error)}")
    raise HTTPException(status_code=500, detail=f"All AI models failed. Please check server logs. Last error: {str(last_error)}")


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
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured")

    try:
        style = "for a 15-year-old using simple words and short sentences" if req.simpleMode else "clearly and concisely"
        prompt = f"Summarize the following election-related text {style}:\n\n{req.text}"

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return SummarizeResponse(summary=response.text)
    except Exception as e:
        print(f"Summarize error: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to the knowledge base.")


@app.post("/analyze-candidates", response_model=CandidateAnalysisResponse)
async def analyze_candidates(req: CandidateAnalysisRequest):
    """Analyze and compare candidates on specified issues."""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured")

    try:
        candidates_str = ", ".join(req.candidateNames)
        issues_str = ", ".join(req.issues)
        prompt = f"""Provide a brief, non-partisan comparison of the following Indian election candidates: {candidates_str}
        
Compare them on these issues: {issues_str}
Location context: {req.location}

Format as a clear, bullet-pointed comparison that helps Indian voters understand the differences.
Use Indian election context: refer to constituencies, ECI rules, party manifestos.
Keep it factual and balanced."""

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return CandidateAnalysisResponse(analysis=response.text)
    except Exception as e:
        print(f"Candidate analysis error: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to the knowledge base.")


@app.post("/next-steps", response_model=NextStepsResponse)
async def next_steps(req: NextStepsRequest):
    """Generate top personalized next actions to improve voter readiness."""
    fallback_steps = get_rule_based_next_steps(req)

    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured")

    try:
        pending_items = [
            key for key, value in req.checklistProgress.items() if not value
        ]
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

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        lines = [line.strip("-• \t") for line in response.text.splitlines() if line.strip()]
        steps = [line for line in lines if len(line) > 3][:3]

        if not steps:
            raise HTTPException(status_code=500, detail="Failed to parse structured steps from AI")

        while len(steps) < 3:
            steps.append(fallback_steps[len(steps)])

        return NextStepsResponse(steps=steps[:3], source="gemini")
    except Exception as e:
        print(f"Next steps generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to the knowledge base.")





if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
