# CivicGuide India - Developer Reference Guide

## Quick Reference for India Terminology

### Always Use These Terms
✅ **Polling Station** (never "Polling Place" or "Voting Center")  
✅ **Booth** (voting cubicle)  
✅ **Constituency** (geographic voting area)  
✅ **Voter ID** or **EPIC** (not Social Security Number)  
✅ **Aadhaar Card** (unique ID with photo)  
✅ **Electronic Voting Machine (EVM)** with **VVPAT**  
✅ **Election Commission of India (ECI)** (official authority)  
✅ **NVSP Portal** (Voter Services Portal - www.eci.gov.in/nvsp/)  
✅ **Voter Helpline** (1950)  
✅ **Form 6** (voter registration form)  
✅ **Lok Sabha** (national parliament elections)  
✅ **State Assembly** (state legislature elections)  
✅ **Local Body** (municipal/panchayat elections)  

### Never Use These Terms
❌ "Polling Place" → Use "Polling Station"  
❌ "Voting Center" → Use "Polling Station"  
❌ "Precinct" → Use "Constituency" or "Polling Station"  
❌ "State laws" → Use "ECI guidelines" or state-specific rules  
❌ "Social Security Number" → Use "Voter ID" or "Aadhaar"  
❌ "American citizen" → Use "Indian citizen"  
❌ "Registration deadline" → Use "Form 6 submission deadline"  
❌ "General election" → Use "Lok Sabha elections"  
❌ "County" → Use "District" or "State"  

---

## Code Examples

### Using India Constants
```typescript
import { INDIA_ELECTION_SYSTEM, INDIA_ELECTION_TERMINOLOGY } from "@/lib/india-election-constants";

// Valid IDs
const validIds = INDIA_ELECTION_SYSTEM.VALID_IDS;
// Returns priority list: Voter ID, Aadhaar, Passport, Driving License, PAN, Service ID

// Election Types
const electionTypes = INDIA_ELECTION_SYSTEM.ELECTION_TYPES;
// LOK_SABHA, STATE_ASSEMBLY, LOCAL_BODY

// Polling Booth Hours
const hours = INDIA_ELECTION_SYSTEM.POLLING_BOOTH_DETAILS.typical_hours;
// "7:00 AM - 6:00 PM"

// ECI Resources
const eci = INDIA_ELECTION_SYSTEM.ELECTION_COMMISSION;
// name: "Election Commission of India"
// website: "www.eci.gov.in"
// helpline: "1950"
```

### String Replacement Pattern
```typescript
// ❌ Bad (US terminology)
`Your polling place will be open from 7 AM to 8 PM`

// ✅ Good (India terminology)
`Your polling station will be open from 7 AM to 6 PM`
```

### Voter Registration Guide
```typescript
// Use this text for registration guidance
`Register as a voter using Form 6:
1. Online at www.eci.gov.in
2. In-person at your polling station
3. At Gram Panchayat or Municipal Office
4. By postal submission

Register at least 45 days before polling date.`
```

### Valid ID Messaging
```typescript
// Always mention in this priority order
const acceptedIds = [
  "Voter ID Card (EPIC)",
  "Aadhaar Card",
  "Indian Passport",
  "Driving License",
  "PAN Card",
  "Service ID Card"
];
```

---

## API Response Guidelines

### Chat/AI Responses
Always include:
- ✅ Reference to official ECI sources
- ✅ Indian terminology (polling station, booth, constituency)
- ✅ Form 6 for registration mentions
- ✅ Valid ID list (Aadhaar, Voter ID priority)
- ✅ Voter Helpline (1950) contact
- ✅ NVSP portal URL

Example:
```
"To find your assigned polling station, use the Voter Helpline app by calling 1950 
or visit the NVSP portal at www.eci.gov.in/nvsp/. Bring a valid ID like Aadhaar or 
Voter ID Card. Polling stations open at 7 AM and close at 6 PM."
```

---

## Component Usage Patterns

### Booth Finder Results
```typescript
// Distance units: ALWAYS use km (not miles)
result.distance = "0.9 km" // ✅
result.distance = "0.9 miles" // ❌

// Polling hours: Standard Indian hours
result.hours = "7:00 AM - 6:00 PM" // ✅
result.hours = "7:00 AM - 8:00 PM" // ❌

// Booth names: India-appropriate
name: "Dadar Polling Station" // ✅
name: "Community Voting Center" // ❌
```

### Dashboard Checklists
```typescript
const VOTER_CHECKLIST = [
  "Registered as Voter (ECI)", // Not "Registered to Vote"
  "Found Polling Station", // Not "Polling Place"
  "Verified Valid ID (Aadhaar/Voter ID)", // Not "Checked ID Requirements"
  "Researched Candidates & Parties",
  "Planned Voting Day Route"
];
```

### AI Agent Descriptions
```typescript
// ✅ Good
{
  title: "Voter Guide Agent",
  description: "Explains ECI registration, valid IDs, voting deadlines...",
  promptFocus: "Provide practical, context-aware Indian election guidance"
}

// ❌ Bad
{
  title: "Voting Guide Agent",
  description: "Explains registration, ID rules, deadlines...",
  promptFocus: "Provide practical step-by-step election guidance"
}
```

---

## File Organization

### Where India Content Lives

**Constants & Reference**
- 📄 `web/src/lib/india-election-constants.ts` - Central India election reference

**India-Specific Components**
- 📱 `web/src/app/dashboard/page.tsx` - Dashboard with India checklist
- 🗳️ `web/src/app/guide/page.tsx` - Voting guide (India-native)
- 🗺️ `web/src/app/api/booths/search/route.ts` - Booth finder (India)
- 🎤 `web/src/app/api/chat/route.ts` - AI chat with India context

**Python Backend**
- 🐍 `agent-service/main.py` - Agent catalog (India)
- 🔧 `agent-service/tools.py` - India-specific tools

---

## Language Support

### Current Languages
- 🇬🇧 English
- 🇮🇳 हिन्दी (Hindi)
- 🇪🇸 Español (Spanish)
- 🇨🇳 中文 (Chinese)
- 🇫🇷 Français (French)
- 🇸🇦 العربية (Arabic)

### Adding New Indian Languages
```typescript
const LANGUAGES = [
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" }, // Tamil
  { code: "te", label: "తెలుగు", flag: "🇮🇳" }, // Telugu
  { code: "ml", label: "മലയാളം", flag: "🇮🇳" }, // Malayalam
  { code: "bn", label: "বাংলা", flag: "🇮🇳" }, // Bengali
  { code: "pa", label: "ਪੰਜਾਬੀ", flag: "🇮🇳" }, // Punjabi
];
```

---

## Testing Checklist

### Content Testing
- [ ] Dashboard shows "Registered as Voter (ECI)"
- [ ] Booth finder shows distances in km
- [ ] Polling hours show 7 AM - 6 PM
- [ ] Onboarding mentions India context
- [ ] AI responses reference ECI
- [ ] Valid IDs list includes Aadhaar first

### Link Testing
- [ ] ECI website links work (www.eci.gov.in)
- [ ] NVSP portal link works
- [ ] All Indian references are current

### Mobile Testing
- [ ] Booth finder responsive on mobile
- [ ] Hindi language readable on mobile
- [ ] Maps display correctly

---

## Common Mistakes to Avoid

❌ Using "state" without "Indian state" context  
❌ Mixing US election terminology  
❌ Miles instead of kilometers for distances  
❌ Evening hours (7-8 PM) instead of 7 AM - 6 PM  
❌ Not mentioning ECI as authority  
❌ Forgetting to mention Aadhaar as valid ID  
❌ Using "polling place" instead of "polling station"  
❌ Referencing 24-hour voting without phase context  
❌ Not mentioning Form 6 for registration  

---

## Quick Integration Checklist

When adding new features:

- [ ] Is terminology India-specific?
- [ ] Does it reference ECI as authority?
- [ ] Are distances in km?
- [ ] Is Aadhaar mentioned for ID verification?
- [ ] Does it mention valid Indian ID documents?
- [ ] Are election types (Lok Sabha, State Assembly, Local Body) clear?
- [ ] Is the Voter Helpline (1950) referenced if relevant?
- [ ] Does it use "polling station" not "polling place"?
- [ ] Is Hindi language option available?
- [ ] Does it fit Indian election context?

---

## Documentation References

- 📋 **INDIA_LOCALIZATION_COMPLETE.md** - Detailed change log
- ✅ **LOCALIZATION_VERIFICATION.md** - Verification checklist
- 🔖 **india-election-constants.ts** - Reference library
- 📚 **Official ECI Website**: www.eci.gov.in

---

**Last Updated**: May 1, 2026  
**Status**: Active for Production  
**Platform**: CivicGuide India Elections v2.0
