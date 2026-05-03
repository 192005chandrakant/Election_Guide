def get_voter_registration_deadline(state: str) -> str:
    """
    Get the voter registration deadline for a specific Indian state or UT.
    
    Args:
        state: The name of the Indian state or Union Territory (e.g., "Maharashtra", "Delhi").
        
    Returns:
        A string describing the voter registration deadline for that state/UT.
    """
    # Registration deadlines typically 45 days before polling in India
    # State-specific variations may apply
    state_lower = state.lower().strip()
    
    # Mock data with India-specific information
    deadlines = {
        "maharashtra": "In Maharashtra, the voter registration deadline (Form 6 submission) is typically 45 days before the scheduled polling date. Check ECI website (www.eci.gov.in) for your constituency's specific dates.",
        "delhi": "In Delhi, voter registration must be completed at least 45 days before polling. Use NVSP portal at www.eci.gov.in/nvsp/ to check deadlines and register online.",
        "karnataka": "Karnataka's voter registration deadline is 45 days before the election. Register online at www.eci.gov.in or visit your local polling station.",
        "tamil_nadu": "Tamil Nadu follows the standard 45-day registration deadline before polling. Check your constituency's dates on the ECI website.",
    }
    
    return deadlines.get(
        state_lower, 
        f"For {state}, voter registration typically closes 45 days before the scheduled polling date. Visit www.eci.gov.in or call 1950 (Voter Helpline) for exact dates in your constituency."
    )

def get_polling_location_info(address: str) -> str:
    """
    Get the assigned polling station and details for a given address in India.
    
    Args:
        address: The voter's residential address or PIN code.
        
    Returns:
        A string detailing the assigned polling booth, its hours, and instructions.
    """
    # Mock response - in production would query ECI database
    return (
        f"To find your polling station for address '{address}', use the Voter Helpline app or visit NVSP portal at www.eci.gov.in. "
        "Polling stations in India typically operate from 7:00 AM to 6:00 PM. "
        "Bring valid photo ID (Voter ID, Aadhaar, Passport, or Driving License). "
        "Current estimated wait time varies by location and time of day (usually 15-45 minutes)."
    )

def get_candidate_info_india(candidate_name: str) -> str:
    """
    Get a summary of an Indian political candidate's background and platform.
    
    Args:
        candidate_name: The name of the Indian political candidate.
        
    Returns:
        A brief, non-partisan summary of the candidate's background, party affiliation, and stated priorities.
    """
    # Mock data - in production would query ECI candidate database
    candidates_db = {
        "rajesh sharma": "Rajesh Sharma (BJP) - 10-year MP. Focus areas: Infrastructure development, Make in India, Economic growth.",
        "priya desai": "Priya Desai (INC) - Social activist and former state legislator. Priorities: Healthcare, education, welfare schemes.",
        "aarav patel": "Aarav Patel (AAP) - Anti-corruption advocate. Focus: Digital governance, transparency, urban development.",
    }
    
    name_lower = candidate_name.lower().strip()
    return candidates_db.get(
        name_lower,
        f"For detailed information on {candidate_name}, check the official ECI Candidate Database at www.eci.gov.in/candidates. "
        "You can review their official affidavit, background, and credentials. Also check party manifestos and local news for their policy positions."
    )

def get_valid_voter_ids_india() -> str:
    """
    Get list of valid identification documents for voting in India.
    
    Returns:
        A string listing all acceptable voter IDs in India.
    """
    return (
        "Valid photo IDs for voting in India:\n"
        "1. Voter ID Card (EPIC) - Issued by Election Commission\n"
        "2. Aadhaar Card (with photo) - UIDAI\n"
        "3. Indian Passport - Government of India\n"
        "4. Driving License - State RTO\n"
        "5. PAN Card (with photo) - Income Tax Department\n"
        "6. Service ID Card - Railway/Postal Service\n\n"
        "Alternative documents (if no photo ID): Utility bills, bank statements, ration card, or school certificate with name and address."
    )

def get_eci_helpline() -> str:
    """
    Get contact information for Election Commission of India resources.
    
    Returns:
        ECI contact details and resources.
    """
    return (
        "Election Commission of India Resources:\n"
        "• Voter Helpline: 1950 (Toll-free)\n"
        "• Official Website: www.eci.gov.in\n"
        "• Voter Services Portal (NVSP): www.eci.gov.in/nvsp/\n"
        "• Check voter registration, find polling station, and register to vote\n"
        "• Candidate Database: www.eci.gov.in/candidates"
    )

# List of tools to pass to Gemini
agent_tools = [
    get_voter_registration_deadline,
    get_polling_location_info,
    get_candidate_info_india,
    get_valid_voter_ids_india,
    get_eci_helpline
]
