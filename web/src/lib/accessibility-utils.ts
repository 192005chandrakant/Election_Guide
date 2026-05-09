/**
 * Accessibility Utilities
 * Provides utilities for WCAG AAA compliance
 */

/**
 * Creates accessible announcement for screen readers
 * Used for dynamic content updates without page navigation
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  if (typeof window === 'undefined') return

  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement is read
  setTimeout(() => {
    announcement.remove()
  }, 1000)
}

/**
 * Manages focus for modal or overlay content
 */
export const focusTrap = (element: HTMLElement | null) => {
  if (!element) return () => {}

  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)

  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Checks if element is visible to screen readers
 */
export const isAccessible = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element)
  
  return !(
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    element.getAttribute('aria-hidden') === 'true'
  )
}

/**
 * Gets accessible name of element
 * Follows ACCNAME algorithm
 */
export const getAccessibleName = (element: HTMLElement): string => {
  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    const labels = labelledBy.split(' ')
    return labels
      .map((id) => {
        const label = document.getElementById(id)
        return label?.textContent || ''
      })
      .filter(Boolean)
      .join(' ')
  }

  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  // Check associated label (for form inputs)
  if (element instanceof HTMLInputElement && element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`)
    if (label) return label.textContent || ''
  }

  // Check title attribute
  const title = element.getAttribute('title')
  if (title) return title

  // Get text content
  return element.textContent || ''
}

/**
 * Validates color contrast ratio (WCAG AAA: 7:1)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const luminance = (color: string): number => {
    const rgb = color.match(/\d+/g)?.map((x) => parseInt(x)) || [0, 0, 0]
    const [r, g, b] = rgb.slice(0, 3).map((x) => {
      x = x / 255
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const l1 = luminance(color1)
  const l2 = luminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast meets WCAG AAA (7:1)
 */
export const meetsWCAGAAA = (
  color1: string,
  color2: string
): boolean => {
  return getContrastRatio(color1, color2) >= 7
}

/**
 * Skip to main content link handler
 */
export const setupSkipLink = () => {
  const skipLink = document.querySelector('a[href="#main-content"]')
  if (!skipLink) return

  skipLink.addEventListener('click', (e) => {
    e.preventDefault()
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView()
    }
  })
}

/**
 * Announce page change to screen readers
 */
export const announcePageChange = (pageTitle: string) => {
  announceToScreenReader(`Navigated to ${pageTitle}`, 'assertive')
}

export default {
  announceToScreenReader,
  focusTrap,
  isAccessible,
  getAccessibleName,
  getContrastRatio,
  meetsWCAGAAA,
  setupSkipLink,
  announcePageChange,
}
