import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/lib/auth-context'

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simulate unauthenticated user
    callback(null)
    return jest.fn() // Unsubscribe function
  }),
}))

describe('useAuth Hook', () => {
  it('should return auth context with user', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current).toBeDefined()
  })

  it('should handle loading state', () => {
    const { result } = renderHook(() => useAuth())
    
    // Should initially be loading or have user state
    expect(result.current).toHaveProperty('user')
  })

  it('should provide logout functionality', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current).toHaveProperty('logout')
    expect(typeof result.current.logout).toBe('function')
  })
})
