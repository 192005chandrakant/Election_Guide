import { CIVIC_AGENTS } from '@/lib/civic-agents'

describe('Civic Agents Configuration', () => {
  it('should define multiple agents', () => {
    expect(CIVIC_AGENTS).toBeDefined()
    expect(Array.isArray(CIVIC_AGENTS)).toBe(true)
    expect(CIVIC_AGENTS.length).toBeGreaterThan(0)
  })

  it('each agent should have required properties', () => {
    CIVIC_AGENTS.forEach((agent: any) => {
      expect(agent).toHaveProperty('name')
      expect(agent).toHaveProperty('description')
      expect(typeof agent.name).toBe('string')
      expect(typeof agent.description).toBe('string')
    })
  })

  it('should include voter readiness agent', () => {
    const voterAgent = CIVIC_AGENTS.find(
      (agent: any) => agent.name.toLowerCase().includes('readiness')
    )
    expect(voterAgent).toBeDefined()
  })

  it('should include different specialized agents', () => {
    const agentNames = CIVIC_AGENTS.map((agent: any) => agent.name.toLowerCase())
    
    // Should have variety of agents
    expect(agentNames.length).toBeGreaterThanOrEqual(2)
  })
})
