# CivicGuide – Architecture & Workflows

This document details the updated architectural blueprints and specific workflow diagrams for the CivicGuide Progressive Web App.

## 1. High-Level Architecture

```mermaid
graph TD
    Client[Next.js PWA Client] -->|UI & Routing| NextAPI[Next.js API Routes]
    
    NextAPI -->|Auth, Users, Elections| Firebase[(Firebase Auth & Firestore)]
    NextAPI -->|Location Data| MapsAPI[Google Maps API]
    
    Client -->|Agent Queries| PythonAgent[Python AI Agent Service]
    NextAPI -->|Agent Coordination| PythonAgent
    
    PythonAgent -->|LLM Calls| Gemini[Gemini API]
    PythonAgent -->|Vector DB / Memory| Memory[(Local Vector DB / Firebase)]
```

## 2. Detailed Workflows

### 2.1 User Authentication & Onboarding Workflow

```mermaid
sequenceDiagram
    participant User
    participant Client as Next.js PWA
    participant Firebase
    
    User->>Client: Clicks "Get Started"
    Client->>Firebase: Trigger Google/Email Auth
    Firebase-->>Client: Returns Auth Token & User Info
    Client->>Firebase: Check if User exists in Firestore
    
    alt New User
        Client->>User: Show Conversational Onboarding (Location, Experience)
        User->>Client: Submits Details
        Client->>Firebase: Create User Profile in Firestore
    end
    
    Client->>User: Redirect to Personalized Dashboard
```

### 2.2 AI Agent (Python) Interaction Workflow

```mermaid
sequenceDiagram
    participant User
    participant Client as Next.js UI
    participant PythonAgent as Python Agent API
    participant Gemini as Gemini API
    participant Firebase as Firestore
    
    User->>Client: Asks "What are the ID requirements in Maharashtra?"
    Client->>PythonAgent: POST /chat {query, userId}
    
    PythonAgent->>Firebase: Fetch User Context (Location: Maharashtra)
    Firebase-->>PythonAgent: Returns User Context
    
    PythonAgent->>PythonAgent: Construct System Prompt with Context
    PythonAgent->>Gemini: Request LLM Completion
    Gemini-->>PythonAgent: Returns Answer
    
    PythonAgent->>Firebase: Log interaction for future context
    PythonAgent-->>Client: Stream/Return Answer
    Client->>User: Displays response in Chat UI
```

### 2.3 Interactive Election Journey & Gamification Workflow

```mermaid
sequenceDiagram
    participant User
    participant Dashboard as Next.js Dashboard
    participant Firebase
    
    User->>Dashboard: Views Timeline
    Dashboard->>Firebase: Fetch Election Deadlines & User Checklist
    Firebase-->>Dashboard: Returns Data
    
    Dashboard->>User: Displays Progress Bar (e.g. 60%)
    User->>Dashboard: Marks "Registered to Vote" as Complete
    
    Dashboard->>Firebase: Update Checklist Status
    Firebase-->>Dashboard: Confirm Update
    
    Dashboard->>Dashboard: Recalculate Readiness Score
    alt Score Reaches 100%
        Dashboard->>User: Trigger Confetti Animation & Award "Voter Ready" Badge
    end
```

### 2.4 Polling Station Finder Workflow

```mermaid
sequenceDiagram
    participant User
    participant Client as Next.js Map UI
    participant MapsAPI as Google Maps API
    participant Firebase
    
    User->>Client: Opens "Find Polling Station"
    Client->>Firebase: Get User Registered Address
    Firebase-->>Client: Returns Address
    
    Client->>MapsAPI: Request nearby polling stations for Address
    MapsAPI-->>Client: Returns Coordinates & Details
    
    Client->>User: Render Map Markers & Distance
    User->>Client: Clicks "Navigate"
    Client->>User: Open Native Maps / Provide Directions
```

## 3. Technology Stack Breakdown
- **Frontend Core:** Next.js (App Router), Tailwind CSS, shadcn/ui components, Framer Motion.
- **Accessibility & Voice Layer:** Web Speech API for TTS, Context-based theming (High Contrast, Dynamic Text Sizing).
- **Main Backend:** Next.js API Routes (Serverless endpoints for standard data fetching).
- **Agent Microservice:** Python (FastAPI/Flask) handling advanced agent logic.
- **AI/LLM:** Gemini API.
- **Database:** Firebase (Auth & Firestore).
- **Location:** Google Maps API.
