export type Candidate = {
  id: string;
  name: string;
  party: string;
  description: string;
  avatar: string;
};

export type BallotMeasure = {
  id: string;
  title: string;
  description: string;
  financialImpact: string;
};

export type BallotRace = {
  id: string;
  office: string;
  instructions: string;
  candidates: Candidate[];
};

export type BallotData = {
  electionName: string;
  date: string;
  location: string;
  races: BallotRace[];
  measures: BallotMeasure[];
};

export const MOCK_BALLOT: BallotData = {
  electionName: "2026 Lok Sabha General Elections",
  date: "April 19, 2026",
  location: "Maharashtra State",
  races: [
    {
      id: "ls_1",
      office: "Lok Sabha Member (Mumbai Central)",
      instructions: "Vote for ONE",
      candidates: [
        {
          id: "ls_1_1",
          name: "Rajesh Sharma",
          party: "Bharatiya Janata Party (BJP)",
          description: "Incumbent MP. Focus on infrastructure development, Make in India initiatives, and economic growth. Experience: 10 years in Parliament.",
          avatar: "RS",
        },
        {
          id: "ls_1_2",
          name: "Priya Desai",
          party: "Indian National Congress (INC)",
          description: "Social activist and former state legislator. Prioritizes healthcare, education, and welfare schemes for marginalized communities. Experience: 8 years in state assembly.",
          avatar: "PD",
        },
        {
          id: "ls_1_3",
          name: "Aarav Patel",
          party: "Aam Aadmi Party (AAP)",
          description: "Anti-corruption crusader and civil rights advocate. Focuses on transparency, digital governance, and urban development. Experience: Community organizer for 12 years.",
          avatar: "AP",
        },
      ],
    },
    {
      id: "assembly_1",
      office: "State Assembly Member (Dadar)",
      instructions: "Vote for ONE",
      candidates: [
        {
          id: "assembly_1_1",
          name: "Ananya Kulkarni",
          party: "Shiv Sena",
          description: "Advocate for Marathi language, local culture preservation, and regional rights. Supports small business growth and farmer welfare. Experience: 15 years in local governance.",
          avatar: "AK",
        },
        {
          id: "assembly_1_2",
          name: "Vikram Singh",
          party: "Bharatiya Janata Party (BJP)",
          description: "Infrastructure and business development expert. Focused on creating jobs, improving transportation, and attracting investments. Experience: Business background and 6 years in assembly.",
          avatar: "VS",
        },
        {
          id: "assembly_1_3",
          name: "Shreya Menon",
          party: "National Congress Party (NCP)",
          description: "Women's rights activist and education reformer. Advocates for gender equality, improved education system, and rural development. Experience: NGO founder and social worker.",
          avatar: "SM",
        },
      ],
    },
  ],
  measures: [
    {
      id: "ref_1",
      title: "Awareness: National Infrastructure Development Plan",
      description: "The government proposes investment of ₹1 trillion in national infrastructure including highways, railways, and smart cities. This survey measures public awareness of this initiative.",
      financialImpact: "Estimated to create 2 million jobs and boost GDP growth by 1.5% over 5 years. Funded through public-private partnerships.",
    },
    {
      id: "ref_2",
      title: "Public Opinion: Agricultural Reform Policies",
      description: "Measures public sentiment on recent agricultural policies including minimum support price (MSP), crop insurance schemes, and farmer subsidy programs.",
      financialImpact: "MSP currently costs ₹1.5 trillion annually. Proposed reforms aim to improve efficiency while protecting farmer incomes.",
    },
  ],
};
