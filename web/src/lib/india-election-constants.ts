/**
 * India Election Constants & Utilities
 * Centralized reference for Indian election system terminology and data
 */

export const INDIA_ELECTION_SYSTEM = {
  ELECTION_COMMISSION: {
    name: "Election Commission of India",
    shortName: "ECI",
    website: "www.eci.gov.in",
    voterRegistration: "https://www.eci.gov.in/",
    helpline: "1950",
  },
  VOTER_DATABASES: {
    NVSP: {
      name: "National Voter Services Portal",
      url: "https://www.eci.gov.in/nvsp/",
      purpose: "Check voter registration, download EPIC, update details",
    },
    VOTER_HELPLINE_APP: {
      name: "Voter Helpline Mobile App",
      helpline: "1950",
      purpose: "Find polling station, check voter status, eligibility",
    },
  },
  VALID_IDS: [
    {
      name: "Voter ID Card (EPIC)",
      issued_by: "Election Commission of India",
      priority: 1,
      description: "Official voter identity card issued by ECI",
    },
    {
      name: "Aadhaar Card",
      issued_by: "UIDAI",
      priority: 1,
      description: "12-digit unique identity number with photo",
    },
    {
      name: "Indian Passport",
      issued_by: "Government of India",
      priority: 2,
      description: "Official travel and identity document",
    },
    {
      name: "Driving License",
      issued_by: "State RTO",
      priority: 2,
      description: "Valid driving authorization with photo",
    },
    {
      name: "PAN Card",
      issued_by: "Income Tax Department",
      priority: 2,
      description: "Permanent Account Number card with photo",
    },
    {
      name: "Service ID Card",
      issued_by: "Railway/Postal Service",
      priority: 3,
      description: "Official employee identity card",
    },
  ],
  ALTERNATIVE_DOCS: [
    "Utility bills (electricity, water, gas) with name and address",
    "Bank statement or passbook with name and address",
    "Post office account statement with name and address",
    "Ration card with name and address",
    "School leaving certificate with name and address",
    "Birth certificate",
    "Domicile certificate",
  ],
  REGISTRATION_FORMS: {
    FORM_6: {
      number: "Form 6",
      name: "Application for Registration of Electors",
      used_for: "Initial voter registration",
      submission_methods: [
        "Online at www.eci.gov.in",
        "In-person at polling station",
        "At Gram Panchayat or Municipal Office",
        "By postal submission",
      ],
      timeline: "Register at least 45 days before polling date",
    },
    FORM_8: {
      number: "Form 8",
      name: "Application for Inclusion of Name in Electoral Roll",
      used_for: "If voter roll list shows your name in a different constituency",
    },
  },
  ELECTION_TYPES: {
    LOK_SABHA: {
      name: "Lok Sabha Elections",
      level: "National",
      frequency: "Every 5 years",
      description: "General Elections - voting for national parliament members",
      candidates: "Lok Sabha Members (MPs) - 543 constituencies",
      body: "Lower House of Indian Parliament",
    },
    STATE_ASSEMBLY: {
      name: "State Legislative Assembly Elections",
      level: "State",
      frequency: "Every 5 years (varies by state)",
      description: "State parliament elections - voting for local representatives",
      candidates: "State Assembly Members (MLAs) - varies by state",
      body: "State Legislative Assembly",
    },
    LOCAL_BODY: {
      name: "Local Body Elections",
      level: "District/City",
      frequency: "Every 5 years (varies by area)",
      description: "Municipal/Panchayat elections - voting for local governance",
      candidates: "Municipal/Panchayat representatives",
      body: "Municipal Corporation / Gram Panchayat",
    },
  },
  VOTING_OPTIONS: {
    ELECTION_DAY_VOTING: {
      name: "Election Day Voting",
      when: "On the scheduled polling date",
      where: "Your assigned polling station",
      who: "All registered voters",
      how: "Use Electronic Voting Machine (EVM) with VVPAT",
    },
    ADVANCE_VOTING: {
      name: "Advance Voting",
      when: "Before election day",
      eligible: ["Government employees", "Elderly citizens (above 85)", "Persons with disabilities", "Essential service workers"],
      requirement: "Apply in advance (usually 15-30 days before)",
      procedure: "Contact local election office for application",
    },
    POSTAL_VOTING: {
      name: "Postal Voting",
      when: "Before election day",
      eligible: [
        "Armed forces personnel",
        "Central paramilitary forces",
        "Election officers on duty",
        "Certain government employees on election duty",
        "Persons in isolation/hospital",
      ],
      requirement: "Apply to local election office",
    },
  },
  POLLING_BOOTH_DETAILS: {
    typical_hours: "7:00 AM - 6:00 PM",
    typical_wait: "15-60 minutes depending on time and location",
    facilities: ["Wheelchair accessible booths", "Braille instructions", "Audio assistance for visually impaired"],
    items_allowed: ["Valid ID", "Water/snacks", "Assistive devices"],
    items_not_allowed: ["Mobile phones", "Cameras", "Weapons"],
  },
  VOTING_PROCESS: {
    steps: [
      "Bring valid ID to polling station",
      "Report to polling officer at entrance",
      "Officer verifies your name in voter roll",
      "Officer marks index finger with indelible ink",
      "Officer issues ballot paper/EVM serial number",
      "Go to booth and mark your vote on EVM",
      "Verify your choice on VVPAT slip",
      "Vote is recorded and counted on election day",
    ],
  },
  INDELIBLE_INK: {
    purpose: "Prevents duplicate voting",
    duration: "Lasts 2-3 days",
    marking: "Applied on index finger after voting",
    note: "Cannot be easily washed off",
  },
  EVM_VVPAT: {
    EVM: "Electronic Voting Machine - records your vote digitally",
    VVPAT: "Voter-Verified Paper Audit Trail - prints a paper receipt showing your choice",
    process: "Press button for your choice, verify on VVPAT, vote is recorded",
  },
  INDIAN_STATES: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi (NCT)",
    "Puducherry (UT)",
    "Andaman & Nicobar",
    "Chandigarh",
    "Dadra & Nagar Haveli",
    "Daman & Diu",
    "Lakshadweep",
    "Ladakh",
  ],
};

export const INDIA_ELECTION_TERMINOLOGY = {
  // Polling Terminology
  "polling_station": "Polling Station (not Polling Place/Center)",
  "booth": "Booth (voting cubicle at polling station)",
  "voter_roll": "Voter Roll / Electoral Roll (official list of voters in a constituency)",
  "constituency": "Constituency (geographic area for elections)",
  "polling_agent": "Polling Agent (representative authorized by candidate/party at polling station)",
  "presiding_officer": "Presiding Officer (in-charge of polling station)",
  
  // Voter Related
  "voter_id": "Voter ID / EPIC (Electoral Photo Identity Card)",
  "eligible_voter": "Registered voter meeting all eligibility criteria",
  "first_time_voter": "First-time voter registering to vote",
  "swing_voter": "Voter who changes voting preference across elections",
  
  // Document Related
  "indelible_ink": "Indelible Ink (permanent mark on voter's finger to prevent double voting)",
  "voter_slip": "Voter Slip (notification sent to voter about their booth and timing)",
  "candidate_affidavit": "Candidate Affidavit (sworn statement of candidate's details filed with ECI)",
  
  // Technical Terms
  "evm": "EVM (Electronic Voting Machine)",
  "vvpat": "VVPAT (Voter-Verified Paper Audit Trail)",
  "vvpat_slip": "VVPAT Slip (paper receipt showing your vote choice)",
  
  // Election Levels
  "lok_sabha": "Lok Sabha Elections (National General Elections)",
  "state_assembly": "State Legislative Assembly Elections (State elections)",
  "local_body": "Local Body Elections (Municipal/Panchayat elections)",
  
  // Voting Methods
  "election_day_voting": "Vote on election day at polling station",
  "advance_voting": "Vote in advance (for eligible voters)",
  "postal_voting": "Vote by postal method (for eligible voters)",
  
  // Other Terms
  "election_phase": "Phase (election held in multiple phases/rounds)",
  "nomination_day": "Day when candidates can nominate themselves",
  "withdrawal_day": "Last day for candidates to withdraw from contest",
  "counting_day": "Day when votes are counted and results declared",
};

export function getIndiaElectionInfo(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("valid id") || lowerQuery.includes("document")) {
    return `Valid IDs for voting in India: ${INDIA_ELECTION_SYSTEM.VALID_IDS.map(id => id.name).join(", ")}. Also accepted: ${INDIA_ELECTION_SYSTEM.ALTERNATIVE_DOCS.slice(0, 3).join(", ")}.`;
  }
  
  if (lowerQuery.includes("register") || lowerQuery.includes("registration")) {
    return `Register to vote using Form 6 at www.eci.gov.in or in-person. Register at least 45 days before the polling date.`;
  }
  
  if (lowerQuery.includes("polling station") || lowerQuery.includes("booth")) {
    return `Find your polling station using the Voter Helpline app by calling 1950 or visiting NVSP portal at www.eci.gov.in.`;
  }
  
  if (lowerQuery.includes("voting") && lowerQuery.includes("day")) {
    return `Voting hours: typically 7:00 AM to 6:00 PM. Bring valid ID, vote on EVM, verify on VVPAT, and get indelible ink mark.`;
  }
  
  if (lowerQuery.includes("state") || lowerQuery.includes("assembly")) {
    return `State Assembly elections are for state legislators (MLAs). Different states have different election schedules.`;
  }
  
  return "";
}

export const INDIA_ELECTION_LINKS = {
  OFFICIAL_SOURCES: {
    ECI_WEBSITE: "https://www.eci.gov.in",
    NVSP_PORTAL: "https://www.eci.gov.in/nvsp/",
    VOTER_HELPLINE: "1950",
  },
  INFORMATION: {
    ELIGIBILITY: "https://www.eci.gov.in/registration-of-voters/eligibility",
    REGISTRATION: "https://www.eci.gov.in/registration-of-voters",
    ID_REQUIREMENTS: "https://www.eci.gov.in/valid-ids-for-voting",
    CANDIDATE_DATABASE: "https://www.eci.gov.in/candidates",
  },
};
