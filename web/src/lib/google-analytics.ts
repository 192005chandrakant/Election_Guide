/**
 * Google Analytics 4 Integration for CivicGuide
 * Tracks user interactions, conversions, and page views
 */

// Initialize GA4
export const initializeGoogleAnalytics = () => {
  if (typeof window === 'undefined') return
  
  const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
  if (!measurementId) {
    console.warn('Google Analytics ID not configured')
    return
  }

  // Load Google Analytics script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  // Initialize gtag
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments)
  }
  gtag('js', new Date())
  gtag('config', measurementId, {
    page_path: window.location.pathname,
    send_page_view: true,
    anonymize_ip: true,
  })

  window.gtag = gtag
}

// Track page views
export const trackPageView = (path: string, title: string) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    send_page_view: false,
  })
}

// Track custom events
export const trackEvent = (
  eventName: string,
  eventData?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', eventName, eventData || {})
}

// Track user interactions
export const trackUserAction = (
  action: string,
  category: string,
  label?: string
) => {
  trackEvent(action, {
    event_category: category,
    event_label: label,
  })
}

// Track voter readiness progress
export const trackReadinessProgress = (score: number, category: string) => {
  trackEvent('readiness_progress_updated', {
    readiness_score: score,
    category: category,
    timestamp: new Date().toISOString(),
  })
}

// Track booth finder usage
export const trackBoothSearch = (constituency: string) => {
  trackEvent('booth_search', {
    constituency: constituency,
    timestamp: new Date().toISOString(),
  })
}

// Track candidate comparison
export const trackCandidateComparison = (candidateCount: number) => {
  trackEvent('candidate_comparison', {
    candidates_compared: candidateCount,
    timestamp: new Date().toISOString(),
  })
}

// Track AI assistant usage
export const trackAssistantInteraction = (agentType: string) => {
  trackEvent('assistant_interaction', {
    agent_type: agentType,
    timestamp: new Date().toISOString(),
  })
}

// Track conversion: User completes voting checklist
export const trackVotingChecklistCompletion = () => {
  trackEvent('voting_checklist_completed', {
    conversion_type: 'primary',
    timestamp: new Date().toISOString(),
  })
}

// Track offline kit download
export const trackOfflineKitDownload = (format: string) => {
  trackEvent('offline_kit_downloaded', {
    format: format,
    timestamp: new Date().toISOString(),
  })
}

// Track accessibility feature usage
export const trackAccessibilityFeature = (feature: string) => {
  trackEvent('accessibility_feature_used', {
    feature_name: feature,
    timestamp: new Date().toISOString(),
  })
}

// Track language preference change
export const trackLanguageChange = (language: string) => {
  trackEvent('language_changed', {
    language: language,
    timestamp: new Date().toISOString(),
  })
}

// Global types for window object
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export default {
  initializeGoogleAnalytics,
  trackPageView,
  trackEvent,
  trackUserAction,
  trackReadinessProgress,
  trackBoothSearch,
  trackCandidateComparison,
  trackAssistantInteraction,
  trackVotingChecklistCompletion,
  trackOfflineKitDownload,
  trackAccessibilityFeature,
  trackLanguageChange,
}
