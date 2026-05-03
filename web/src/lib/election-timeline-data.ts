import { TimelineStep } from "@/components/ui/timeline";

export const ELECTION_TIMELINE_DATA: TimelineStep[] = [
  {
    id: "check-eligibility",
    title: "✓ Check Your Eligibility",
    description: "Verify if you're eligible to vote in India",
    timeline: "Anytime",
    importance: "high",
    details:
      "You must be an Indian citizen, at least 18 years old, and not disqualified under election law. Residency requirements vary by state.",
    actionItems: [
      "Verify you are an Indian citizen with a valid passport or birth certificate",
      "Confirm you're at least 18 years old on polling day",
      "Check your current address and state of residence",
      "Verify you have no legal disqualifications",
    ],
    tips: [
      "NRIs (Non-Resident Indians) cannot vote online but can apply for a proxy vote",
      "Students can vote in their home constituency or college constituency (not both)",
      "You're eligible to vote 18 days before polling day",
    ],
    docs: [
      {
        label: "Proof of Citizenship",
        description: "Indian passport, birth certificate, or government-issued ID",
      },
      {
        label: "Proof of Age",
        description: "Birth certificate, school certificate, or passport",
      },
    ],
  },
  {
    id: "register-voter",
    title: "📝 Register as a Voter (Voter ID / EPIC)",
    description: "Apply for your Voter ID card if you don't have one",
    timeline: "365+ days before election",
    deadline: "Typically 18 days before polling day",
    importance: "high",
    details:
      "Registration is FREE and is the foundation for voting. You can apply online via the ECI website or visit your local election office. Processing takes 5-15 days.",
    actionItems: [
      "Visit voter.eci.gov.in and click 'Voter Registration'",
      "Fill Form 6 (new voter registration) with correct details",
      "Upload required documents (proof of age, address, citizenship)",
      "Pay if required (usually free for first-time voters)",
      "Keep your Registration Number / Voter ID for reference",
      "Track application status online using reference number",
    ],
    tips: [
      "Registration closes 18 days before polling day",
      "You can apply at any age and you'll be eligible when you turn 18",
      "Duplicate entries lead to vote cancellation - use only one constituency",
      "Mobile app: Download 'Voter Helpline' app for easier registration",
    ],
    docs: [
      {
        label: "Form 6 - New Voter Registration",
        description: "Download from eci.gov.in or collect from election office",
      },
      {
        label: "Proof of Age",
        description: "Birth certificate, school certificate, passport, or Aadhaar",
      },
      {
        label: "Proof of Address",
        description: "Utility bill, rental agreement, Aadhaar, or government letter",
      },
      {
        label: "Identity Proof",
        description: "Aadhaar, passport, driver's license, or PAN card",
      },
    ],
  },
  {
    id: "link-aadhaar",
    title: "🔗 Link Aadhaar with Voter ID (Optional but Recommended)",
    description: "Connect your Aadhaar to prevent duplicate entries",
    timeline: "Anytime after registration",
    importance: "medium",
    details:
      "Linking your Aadhaar with your Voter ID helps prevent duplicate registrations and keeps your record up-to-date. This is completely optional but highly recommended.",
    actionItems: [
      "Visit voter.eci.gov.in",
      "Click 'Aadhaar Link Form (12A)' under Voter Registration",
      "Enter your Voter ID or Name + Father's Name + Age",
      "Upload your Aadhaar and voter ID documents",
      "Submit and wait for confirmation (1-2 weeks)",
    ],
    tips: [
      "Linking Aadhaar reduces duplicate voter registration",
      "You can use Form 12A to link or de-link your Aadhaar",
      "Linking doesn't affect your privacy - Aadhaar details remain protected",
      "Check voter roll after linking to confirm updated details",
    ],
  },
  {
    id: "find-polling-booth",
    title: "📍 Find Your Polling Booth & Constituency",
    description: "Locate where you'll vote on polling day",
    timeline: "7-14 days before polling",
    importance: "high",
    details:
      "The Election Commission publishes the official voter rolls 14-21 days before polling. Once released, you can find your exact polling location using your Voter ID or Name.",
    actionItems: [
      "Visit voter.eci.gov.in or use our Polling Station Finder tool",
      "Enter your Voter ID number or search by Name + Age + Constituency",
      "Note your polling booth number, location, and address",
      "Verify your details and address on the voter roll",
      "Check for any objections or corrections needed",
      "Get directions using Google Maps",
    ],
    tips: [
      "Polling booths are usually located in schools or government buildings",
      "Some booths may be at home during early voting / postal votes",
      "Check if your booth has accessibility features if needed",
      "Note the booth number - you'll need it on voting day",
      "Peak voting times are usually 9-11 AM and 3-5 PM - come early to avoid crowds",
    ],
  },
  {
    id: "research-candidates",
    title: "🔍 Research Candidates & Issues",
    description: "Learn about candidates and their positions on key issues",
    timeline: "21-30 days before polling",
    importance: "medium",
    details:
      "Use official election data, candidate manifestos, and verified news sources to make informed decisions. Compare candidates on issues that matter to you.",
    actionItems: [
      "Visit eci.gov.in for official candidate information",
      "Use our Candidate Comparison tool to compare candidates side-by-side",
      "Read each candidate's manifesto and past performance",
      "Check fact-checkers like Alt News or Boom Live for misinformation",
      "Watch debates and news coverage",
      "Discuss with friends, family, or community forums",
      "Make notes on your preferred candidates by position",
    ],
    tips: [
      "Verify information from official election sources",
      "Beware of misinformation on social media",
      "Focus on facts and policy positions, not just rhetoric",
      "Consider local issues and national policies equally",
      "Use multiple sources for balanced information",
    ],
  },
  {
    id: "prepare-documents",
    title: "🪪 Prepare Your Documents for Polling Day",
    description: "Gather required ID and address proofs",
    timeline: "7 days before polling",
    importance: "high",
    details:
      "You need to bring a valid ID proof on polling day. Without it, you may not be allowed to vote (unless you're in the voter roll and recognized by poll workers).",
    actionItems: [
      "Collect your Voter ID / EPIC card",
      "If no Voter ID, prepare one valid ID from the approved list",
      "Make a photocopy of your ID as backup",
      "Verify the name and details on your ID are correct",
      "Create a checklist of documents to carry",
    ],
    tips: [
      "Bring original ID - photocopies are not accepted",
      "Accept multiple ID proofs: Voter ID, Aadhaar, Passport, Driver's License, PAN card",
      "Without ID, you can vote via 'Form 21A' (voter roll verification) if neighbors recognize you",
      "Keep ID safe - don't misplace it before polling day",
      "Double-check your documents are not expired",
    ],
    docs: [
      {
        label: "Primary ID Proof",
        description: "Voter ID/EPIC card (preferred) or Aadhaar",
      },
      {
        label: "Alternative ID Proof",
        description: "Passport, Driver's License, or PAN card",
      },
      {
        label: "Address Proof (Optional)",
        description: "Utility bill or document showing your registered address",
      },
    ],
  },
  {
    id: "plan-voting",
    title: "📅 Plan Your Voting Day & Timing",
    description: "Decide when and how you'll vote",
    timeline: "7 days before polling",
    importance: "medium",
    details:
      "Plan ahead to ensure you don't miss voting. Check the exact polling hours, plan transportation, and consider the best time to avoid queues.",
    actionItems: [
      "Check official polling hours (usually 7 AM - 6 PM, varies by state)",
      "Plan your route to the polling booth",
      "Arrange transportation if needed (public transport, family ride)",
      "Check if early voting or postal vote is available for your situation",
      "Mark the date and time on your calendar",
      "Plan to go with family or friends if desired",
      "Inform your employer if you need time off",
    ],
    tips: [
      "Voting is a holiday in most states - many offices/schools are closed",
      "Go early (7-9 AM or 4-6 PM) to avoid long queues",
      "The booth closes promptly at 6 PM - be there before then",
      "You can request early voting if you have a valid reason",
      "Postal voting is available for senior citizens (65+) and persons with disabilities",
    ],
  },
  {
    id: "voting-day",
    title: "🗳️ Voting Day - Cast Your Vote",
    description: "Vote on the scheduled polling day",
    status: "current",
    deadline: "Check state election schedule",
    importance: "high",
    details:
      "Arrive at your polling booth with valid ID. The voting process is simple: verify your identity, receive your ballot, vote in secret, and cast your vote. Your vote is protected and confidential.",
    actionItems: [
      "Arrive at your polling booth early with valid ID",
      "Stand in queue - polling staff will verify your identity",
      "Present your valid ID (Voter ID/Aadhaar/Passport/Driver's License)",
      "Get your name marked on the voter roll",
      "Receive your ballot (paper ballot or EVM instructions)",
      "Go to the voting booth and mark your choice in SECRET",
      "For EVM: Touch the button next to your candidate's name once",
      "For VVPAT: Verify the printed receipt matches your choice",
      "Return your ballot or complete EVM voting",
      "Get your finger inked as proof of voting",
    ],
    tips: [
      "Your vote is completely SECRET - nobody can see who you vote for",
      "Don't believe misinformation about voting procedures",
      "Carry your ID - without it, you may face delays or need Form 21A",
      "Dress normally - some states may ask you to remove certain items",
      "If you make a mistake on paper ballot, ask for a new one (spoiled ballot)",
      "Report any irregularities to polling officers immediately",
      "EVM voting is fast and secure - follow booth staff instructions",
      "VVPAT is an additional security feature - verify it matches your choice",
    ],
    docs: [
      {
        label: "Valid ID Proof (Required)",
        description: "Voter ID, Aadhaar, Passport, Driver's License, or PAN",
      },
      {
        label: "Address Proof (Optional)",
        description: "Can help if there's any confusion about your identity",
      },
    ],
  },
  {
    id: "after-voting",
    title: "✅ After Voting - Your Responsibility Continues",
    description: "Monitor results and stay informed",
    timeline: "Polling day onwards",
    importance: "medium",
    details:
      "After you vote, you can monitor results as they're announced. Your civic responsibility also extends to monitoring governance and holding elected representatives accountable.",
    actionItems: [
      "Verify that your vote was counted (check ink on finger, receipt)",
      "Share your voting experience responsibly on social media",
      "Monitor election results on eci.gov.in",
      "Track which candidates and parties won",
      "Read initial analysis and election commissions' reports",
      "Stay informed about your elected representatives' performance",
      "Monitor policy implementation and hold them accountable",
      "Participate in future elections and civic processes",
    ],
    tips: [
      "Results are usually counted and declared 2-3 days after polling",
      "Don't spread unverified information about voting irregularities",
      "Use official sources like ECI website for results and information",
      "Monitor your elected representative's work over the coming months",
      "Participate in local governance, community meetings, and feedback forums",
      "Stay politically informed and engaged as a responsible citizen",
    ],
  },
];

export function getElectionTimeline(): TimelineStep[] {
  // For now, return the full timeline
  // Later, this can be customized based on user scenario
  return ELECTION_TIMELINE_DATA;
}
