This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 📁 Project Structure

### Frontend Code Location
All frontend code for CivicGuide is located in the **`web/src/`** directory:

```
web/src/
├── app/                              # Next.js Pages & API Routes
│   ├── page.tsx                      # Homepage
│   ├── dashboard/page.tsx            # Voter readiness dashboard
│   ├── guide/page.tsx                # Voting guide & instructions
│   ├── candidates/page.tsx           # Candidate comparison
│   ├── ballot/                       # Interactive ballot & voting planning
│   ├── map/page.tsx                  # Polling station finder & map
│   ├── assistant/page.tsx            # AI voting assistant chat
│   ├── settings/page.tsx             # User preferences & accessibility
│   ├── login/page.tsx                # Authentication
│   ├── kit/page.tsx                  # Offline voter election kit
│   ├── notifications/page.tsx        # Voting reminders & updates
│   ├── onboarding/page.tsx           # First-time voter onboarding
│   └── api/                          # Backend API Routes
│       ├── chat/route.ts             # AI chat endpoint (Gemini integration)
│       ├── booths/search/route.ts    # Polling station search API
│       ├── candidates/analyze/       # Candidate analysis endpoint
│       ├── agents/route.ts           # AI agents info
│       ├── readiness/route.ts        # Voter readiness scoring
│       ├── user/route.ts             # User profile endpoints
│       ├── notifications/route.ts    # Push notifications
│       └── next-steps/route.ts       # Smart next steps recommendations
├── components/                       # Reusable React Components
│   ├── navbar.tsx                    # Navigation bar
│   ├── brand-logo.tsx                # CivicGuide logo
│   ├── civic-ui.tsx                  # Civic-specific UI components
│   ├── protected-route.tsx           # Authentication wrapper
│   ├── providers.tsx                 # Context providers
│   └── ui/                           # shadcn/ui component library
├── lib/                              # Utilities & Helper Functions
│   ├── civic-agents.ts               # AI agent definitions & roles
│   ├── india-election-constants.ts   # India election reference library
│   ├── auth-context.tsx              # Authentication context
│   ├── settings-context.tsx          # User settings context
│   ├── firebase.ts                   # Firebase configuration
│   ├── server-firestore.ts           # Server-side Firestore access
│   ├── db.ts                         # Database utilities
│   ├── calendar.ts                   # Calendar utilities
│   ├── user-profile.ts               # User profile logic
│   └── utils.ts                      # General utilities
├── app/globals.css                   # Global styles
├── app/layout.tsx                    # Root layout
└── app/page.tsx                      # Homepage (editable entry point)
```

### Backend Code Location
The **Python AI Agent Service** is in the **`agent-service/`** directory at the root:

```
agent-service/
├── main.py                           # FastAPI server with endpoints
│                                     # - Agent catalog
│                                     # - Chat endpoint (/chat)
│                                     # - Push notifications (/notify)
├── tools.py                          # AI Agent Tools & Functions
│                                     # - Voter registration helpers
│                                     # - Polling station finder
│                                     # - Candidate information
│                                     # - Valid voter IDs
│                                     # - ECI helpline resources
├── db.py                             # Firestore database utilities
│                                     # - Chat history storage
│                                     # - User interactions
│                                     # - FCM token management
├── requirements.txt                  # Python dependencies
│                                     # - FastAPI
│                                     # - google-generativeai
│                                     # - firebase-admin
└── .env.example                      # Environment variables template
                                      # - GEMINI_API_KEY
                                      # - FIREBASE_SERVICE_ACCOUNT_PATH
```

### Database & Data Layer
**Firebase configuration** at the root:

```
dataconnect/                          # Firebase Data Connect schema
├── schema/schema.gql                 # Database schema definitions
├── dataconnect.yaml                  # Data Connect configuration
└── seed_data.gql                     # Sample/test data

src/dataconnect-generated/            # Auto-generated SDK (do not edit)
├── index.cjs.js
├── index.d.ts
└── index.esm.js
```

---

## 🎯 Key Directories Quick Reference

| **Directory** | **Purpose** | **Technology** |
|---|---|---|
| `web/src/app/` | All pages and API routes | Next.js 14+ |
| `web/src/components/` | Reusable UI components | React + Tailwind CSS |
| `web/src/lib/` | Utilities and business logic | TypeScript |
| `agent-service/` | AI backend and tools | Python + FastAPI + Gemini |
| `dataconnect/` | Database schema | Firebase |

---

## 🚀 Development Workflow

### Start Frontend Development Server
```bash
# Navigate to web directory
cd web

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Server runs on http://localhost:3000
```

### Start Backend AI Service
```bash
# Navigate to agent-service directory
cd agent-service

# Create virtual environment (first time)
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from .env.example
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start FastAPI server
python main.py

# Server runs on http://localhost:8000
```

### Build Frontend for Production
```bash
cd web
npm run build
npm start
```

---

## 📝 Important Files for Customization

**Frontend Changes**:
- **Homepage**: `web/src/app/page.tsx`
- **Dashboard**: `web/src/app/dashboard/page.tsx`
- **AI Agents**: `web/src/lib/civic-agents.ts`
- **India Election Data**: `web/src/lib/india-election-constants.ts`

**Backend Changes**:
- **Agent Definitions**: `agent-service/main.py` (AGENT_CATALOG)
- **Tool Functions**: `agent-service/tools.py`
- **Database Logic**: `agent-service/db.py`

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
