# Election Guide Web App Workflow

This document outlines the user flow and architecture of the Election Guide web application.

## 1. User Onboarding

- **Entry Point:** New users land on the homepage (`/`).
- **Authentication:** Users can sign up or log in via the `/login` page. Authentication is handled by Firebase.
- **Onboarding (`/onboarding`):** First-time users are guided through an onboarding process to set up their profile, including location, language, and voter status.

## 2. Core User Journey

The user journey is designed around a central **Dashboard** and a series of specialized feature pages. A `WorkflowRail` component provides a consistent, gamified experience across the app.

### 2.1. Dashboard (`/dashboard`)

- **Central Hub:** The dashboard is the main hub for the user's election readiness journey.
- **Readiness Score:** A prominent score shows the user's overall preparedness.
- **Checklist:** An interactive checklist tracks key tasks (registration, ID, etc.).
- **Gamification:**
    - **XP and Streaks:** Users earn Experience Points (XP) and maintain activity streaks.
    - **Badges:** Achievements are unlocked for completing milestones.
- **Timeline:** A personalized timeline displays important election dates.
- **Smart Navigation:** The `WorkflowRail` suggests the next best action.

### 2.2. Candidate Comparison (`/candidates`)

- **Guided Research:** The `WorkflowRail` guides users through the process of researching and comparing candidates.
- **AI Analysis:** Users can input candidate names and issues to get a non-partisan AI-powered analysis.
- **Database-Backed Showcase:** Candidate cards and quick-start content are loaded from Firestore so the interface renders platform content instead of hardcoded examples.
- **Gamified Interaction:** Users are rewarded for researching multiple candidates and issues.
- **Smart Navigation:** After comparing candidates, users are guided to the `Ballot` page.

### 2.3. Polling Station Finder (`/map`)

- **Guided Search:** The `WorkflowRail` helps users find their polling station.
- **Interactive Map:** An integrated Google Map displays polling locations.
- **Gamified Planning:** Users can save their polling location and plan their route, earning XP.
- **Smart Navigation:** After finding their booth, users are guided to the `Dashboard` to complete their voting plan.

### 2.4. Interactive Ballot (`/ballot`)

- **Guided Ballot Creation:** The `WorkflowRail` assists users in creating a practice ballot.
- **Dynamic Selections:** Users can make selections for various races and measures.
- **Printable Cheat Sheet:** A printable summary of the user's selections can be generated.
- **Gamification:** Completing the ballot contributes to the user's readiness score and XP.
- **Smart Navigation:** After creating a ballot, users are guided back to the `Dashboard`.

### 2.5. Assistant (`/assistant`)

- **Full-Viewport Chat:** The assistant occupies the full viewport and hides the global navbar for an uninterrupted chat workspace.
- **Structured AI Output:** Responses use the configured agent service and preserve the structured response contract for rich UI rendering.
- **Responsive Layout:** The sidebar, message stream, and composer adapt to mobile and desktop without page-level drift or drag behavior.

## 3. Technical Architecture

- **Frontend:**
    - **Framework:** Next.js 14+ with App Router.
    - **Styling:** Tailwind CSS with `shadcn/ui` components.
    - **State Management:** React Context and `useState`.
    - **Animation:** `framer-motion`.
- **Backend:**
    - **Serverless Functions:** Next.js API Routes for handling requests.
    - **AI Integration:** Google Gemini API for AI-powered features.
    - **Database:** Firebase Firestore for user data, profile state, readiness data, and platform showcase content.
- **Authentication:** Firebase Authentication.
- **Deployment:** Vercel.
