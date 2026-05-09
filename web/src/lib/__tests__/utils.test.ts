import { formatDate, calculateReadinessScore, sanitizeInput } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-05-15')
      const result = formatDate(date)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid')
      const result = formatDate(invalidDate)
      expect(result).toBeDefined()
    })
  })

  describe('calculateReadinessScore', () => {
    it('should calculate score from checklist items', () => {
      const items = [
        { completed: true },
        { completed: true },
        { completed: false },
      ]
      const score = calculateReadinessScore(items)
      
      expect(score).toBe(66.67)
    })

    it('should return 0 for empty list', () => {
      const score = calculateReadinessScore([])
      expect(score).toBe(0)
    })

    it('should return 100 for all completed', () => {
      const items = [
        { completed: true },
        { completed: true },
      ]
      const score = calculateReadinessScore(items)
      expect(score).toBe(100)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove malicious HTML', () => {
      const input = '<script>alert("xss")</script>Safe text'
      const result = sanitizeInput(input)
      
      expect(result).not.toContain('<script>')
      expect(result).toContain('Safe text')
    })

    it('should preserve safe HTML entities', () => {
      const input = 'Hello &amp; Welcome'
      const result = sanitizeInput(input)
      
      expect(result).toContain('Hello')
    })

    it('should handle null and undefined', () => {
      expect(sanitizeInput(null)).toBe('')
      expect(sanitizeInput(undefined)).toBe('')
    })
  })
})
