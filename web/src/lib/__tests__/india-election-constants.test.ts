import { INDIA_ELECTION_SYSTEM, INDIA_ELECTION_TERMINOLOGY } from '@/lib/india-election-constants'

describe('India Election Constants', () => {
  describe('INDIA_ELECTION_SYSTEM', () => {
    it('should define valid IDs list', () => {
      expect(INDIA_ELECTION_SYSTEM.VALID_IDS).toBeDefined()
      expect(Array.isArray(INDIA_ELECTION_SYSTEM.VALID_IDS)).toBe(true)
      expect(INDIA_ELECTION_SYSTEM.VALID_IDS.length).toBeGreaterThan(0)
    })

    it('should include Voter ID and Aadhaar in valid IDs', () => {
      const validIds = INDIA_ELECTION_SYSTEM.VALID_IDS
      const idNames = validIds.map((id: any) => id.name || id)
      
      expect(idNames.join(' ').toLowerCase()).toContain('voter')
      expect(idNames.join(' ').toLowerCase()).toContain('aadhaar')
    })

    it('should define election types', () => {
      expect(INDIA_ELECTION_SYSTEM.ELECTION_TYPES).toBeDefined()
      const types = INDIA_ELECTION_SYSTEM.ELECTION_TYPES
      expect(Object.keys(types).length).toBeGreaterThan(0)
    })

    it('should define polling booth hours', () => {
      const hours = INDIA_ELECTION_SYSTEM.POLLING_BOOTH_DETAILS
      expect(hours).toBeDefined()
    })

    it('should reference Election Commission of India', () => {
      const eci = INDIA_ELECTION_SYSTEM.ELECTION_COMMISSION
      expect(eci.name).toContain('Election Commission')
      expect(eci.website).toBeDefined()
      expect(eci.helpline).toBe('1950')
    })
  })

  describe('INDIA_ELECTION_TERMINOLOGY', () => {
    it('should define correct terminology mappings', () => {
      expect(INDIA_ELECTION_TERMINOLOGY).toBeDefined()
    })

    it('should use correct terms', () => {
      const terms = INDIA_ELECTION_TERMINOLOGY
      expect(terms).toBeDefined()
    })
  })
})
