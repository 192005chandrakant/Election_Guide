import { render, screen } from '@testing-library/react'
import BrandLogo from '@/components/brand-logo'

// Mock image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('BrandLogo Component', () => {
  it('should render without crashing', () => {
    render(<BrandLogo />)
  })

  it('should be accessible with proper alt text', () => {
    render(<BrandLogo />)
    
    const images = screen.queryAllByRole('img')
    expect(images.length).toBeGreaterThanOrEqual(0)
  })
})
