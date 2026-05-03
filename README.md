# CivicGuide - AI-Powered Election Assistant for India

<div align="center">
  
**Empowering Indian voters with intelligent, accessible, and verified election guidance** 🇮🇳

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Status](https://img.shields.io/badge/Status-Active%20Development-green)
![Platform](https://img.shields.io/badge/Platform-India%20Elections-blue)
![Version](https://img.shields.io/badge/Version-2.0%20India%20Edition-blueviolet)

</div>

---

## 📖 Overview

CivicGuide is an AI-powered Progressive Web App (PWA) designed specifically for **Indian elections**. It guides voters through every step of the electoral process—from voter registration through voting day—using intelligent recommendations, verified information, accessibility features, and offline support.

**Key Features**:
- 🗳️ **Voter Readiness Engine** - Track preparation progress with interactive checklist
- 🤖 **AI Voting Assistant** - 8 specialized AI agents for guidance (powered by Gemini)
- 🗺️ **Polling Station Finder** - Locate your assigned booth with directions
- 👥 **Candidate Comparison** - Issue-by-issue party & candidate analysis
- 📋 **Interactive Ballot** - Pre-vote and generate voting cheat sheets
- ♿ **Accessibility First** - Voice guidance, high contrast, simple language
- 📱 **Offline Support** - Download voter kits and essential info
- 🌍 **Multi-Language** - English, हिन्दी (Hindi), and more

---

## 🏗️ Project Structure

### Frontend Code Location
**`web/`** - Next.js React application

```
web/src/
├── app/                    # Pages & API routes
│   ├── page.tsx           # Homepage
│   ├── dashboard/         # Voter readiness dashboard
│   ├── guide/             # Voting instructions
│   ├── candidates/        # Candidate comparison
│   ├── ballot/            # Interactive ballot
│   ├── map/               # Polling station map
│   ├── assistant/         # AI chat interface
│   ├── settings/          # Preferences
│   └── api/               # Backend API routes
├── components/            # Reusable components
└── lib/                   # Utilities & context
```

**Start Frontend**:
```bash
cd web
npm install
npm run dev
# Runs on http://localhost:3000
```

---

### Backend Code Location
**`agent-service/`** - Python FastAPI service

```
agent-service/
├── main.py               # FastAPI server & endpoints
├── tools.py             # AI agent tools & functions
├── db.py                # Database utilities
└── requirements.txt     # Dependencies
```

**Start Backend**:
```bash
cd agent-service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

---

### Database & Data
**`dataconnect/`** - Firebase Data Connect schema

```
dataconnect/
├── schema/schema.gql    # Database schema
└── seed_data.gql        # Sample data
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.9+ (for backend)
- **Firebase** project (for database)
- **Gemini API Key** from Google AI Studio

### Installation

1. **Clone & Install Frontend**
```bash
cd web
npm install
```

2. **Setup Backend**
```bash
cd agent-service
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure Environment**
```bash
# In agent-service/.env
GEMINI_API_KEY=your_key_here
```

4. **Start Development**
```bash
# Terminal 1: Frontend
cd web && npm run dev

# Terminal 2: Backend
cd agent-service && python main.py
```

---

## 📁 Full Directory Structure

```
Election_Guide/
├── web/                              # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                      # Pages & API routes
│   │   ├── components/               # React components
│   │   ├── lib/                      # Utilities
│   │   └── globals.css              # Styling
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── README.md
│
├── agent-service/                    # Backend (Python)
│   ├── main.py                       # FastAPI server
│   ├── tools.py                      # Agent tools
│   ├── db.py                         # Database utilities
│   ├── requirements.txt
│   └── .env.example
│
├── dataconnect/                      # Database schema
│   ├── schema/
│   └── seed_data.gql
│
├── src/dataconnect-generated/        # Auto-generated SDK
│
├── DEVELOPER_REFERENCE.md            # India terminology guide
├── INDIA_LOCALIZATION_COMPLETE.md    # Localization details
├── LOCALIZATION_VERIFICATION.md      # Verification checklist
├── development-plan.md               # Development roadmap
├── architecture.md                   # Architecture docs
└── README.md                         # This file
```

---

## 🎯 Key Features

### Voter Readiness Engine
- Interactive checklist tracking voter preparation
- Progress scoring from 0-100%
- Real-time recommendations for next steps
- Gamification with badges and milestones

### AI Voting Assistant (8 Specialized Agents)
1. **Voter Guide Agent** - Registration, ID, voting steps
2. **Readiness Engine** - Prep gap analysis
3. **Polling Station Finder** - Location & directions
4. **Candidate Comparison** - Neutral issue-by-issue analysis
5. **Information Verification** - Trust layer & source credibility
6. **Accessibility Agent** - Simplified language & voice support
7. **Voter Kit Agent** - Offline resources & printables
8. **Smart Notifications** - Timely reminders & updates

### India-Specific Features
- ✅ **ECI Authority** - Official Election Commission of India guidelines
- ✅ **Valid IDs** - Aadhaar, Voter ID, Passport, Driving License, PAN
- ✅ **Voter Registration** - Form 6 process with 45-day deadline
- ✅ **Election Levels** - Lok Sabha, State Assembly, Local Body
- ✅ **Voting System** - EVM with VVPAT explanation
- ✅ **Polling Hours** - 7 AM - 6 PM standard
- ✅ **Polling Station** - Correct Indian terminology throughout
- ✅ **Hindi Support** - हिन्दी language available

---

## 🔧 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | Web UI & routing |
| **Styling** | Tailwind CSS, Framer Motion | Responsive design & animations |
| **AI** | Gemini 1.5 Flash, LangChain | Intelligent responses |
| **Backend** | FastAPI, Python 3.9+ | API server & tools |
| **Database** | Firebase Firestore | Real-time data |
| **Auth** | Firebase Auth | User authentication |
| **Maps** | Google Maps API | Polling station location |
| **Deployment** | Vercel, Cloud Run | Production hosting |

---

## 📚 Documentation

### For Users
- [Voting Guide](web/src/app/guide/page.tsx) - Step-by-step voting instructions
- [Dashboard](web/src/app/dashboard/page.tsx) - Track your preparation progress

### For Developers
- [DEVELOPER_REFERENCE.md](DEVELOPER_REFERENCE.md) - India terminology guide
- [INDIA_LOCALIZATION_COMPLETE.md](INDIA_LOCALIZATION_COMPLETE.md) - Localization details
- [development-plan.md](development-plan.md) - Development roadmap
- [architecture.md](architecture.md) - System architecture
- [web/README.md](web/README.md) - Frontend setup & structure

---

## 🧪 Development & Testing

### Frontend Build
```bash
cd web
npm run build     # Production build
npm run dev       # Development server
npm run lint      # ESLint check
```

### Backend Testing
```bash
cd agent-service
python main.py    # Start server
# Server runs on http://localhost:8000/docs (Swagger UI)
```

### Verify India Content
```bash
# Check for India-specific terminology
grep -r "polling station" web/src/
grep -r "ECI" web/src/
grep -r "Form 6" web/src/
```

---

## 🌍 Deployment

### Frontend (Vercel)
```bash
cd web
vercel deploy
```

### Backend (Google Cloud Run)
```bash
cd agent-service
gcloud run deploy civicguide-agent --source .
```

### Database (Firebase)
- Use Firebase Console for Firestore setup
- Deploy via: `firebase deploy`

---

## 📋 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

### Backend (agent-service/.env)
```env
GEMINI_API_KEY=your_key_here
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
PORT=8000
HOST=0.0.0.0
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes with India election context
3. Test thoroughly
4. Submit a pull request

**Code Guidelines**:
- Use India terminology (polling station, not polling place)
- Reference ECI guidelines
- Include accessibility features
- Test on mobile devices

---

## 📞 Support

- **ECI Official**: www.eci.gov.in
- **Voter Helpline**: 1950
- **NVSP Portal**: www.eci.gov.in/nvsp/

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Election Commission of India (ECI) for guidelines
- Google Generative AI (Gemini) for AI capabilities
- Firebase for backend services
- Next.js community for excellent framework

---

<div align="center">

**Made with ❤️ for Indian Democracy**

CivicGuide v2.0 - India Elections Edition | May 2026

</div>
