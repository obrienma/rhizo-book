import { render, screen } from '@testing-library/react';
import LandingPage from '@/app/(marketing)/page';

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe('LandingPage', () => {
  it('renders the patient card as a link to /register', () => {
    render(<LandingPage />);
    const patientCard = screen.getByRole('link', { name: /for patients/i });
    expect(patientCard).toHaveAttribute('href', '/register');
  });

  it('patient card contains the "Join the network" CTA', () => {
    render(<LandingPage />);
    const patientCard = screen.getByRole('link', { name: /for patients/i });
    expect(patientCard).toHaveTextContent(/join the network/i);
  });

  it('patient card has no nested anchor elements', () => {
    render(<LandingPage />);
    const patientCard = screen.getByRole('link', { name: /for patients/i });
    expect(patientCard.querySelectorAll('a')).toHaveLength(0);
  });

  it('renders Sign In nav link(s) pointing to /login', () => {
    render(<LandingPage />);
    const signInLinks = screen.getAllByRole('link', { name: /sign in/i });
    expect(signInLinks.length).toBeGreaterThan(0);
    signInLinks.forEach((link) => expect(link).toHaveAttribute('href', '/login'));
  });

  it('renders the provider card as a link to /register/provider', () => {
    render(<LandingPage />);
    const providerCard = screen.getByRole('link', { name: /for providers/i });
    expect(providerCard).toHaveAttribute('href', '/register/provider');
  });

  it('provider card contains the "Join as a provider" CTA', () => {
    render(<LandingPage />);
    const providerCard = screen.getByRole('link', { name: /for providers/i });
    expect(providerCard).toHaveTextContent(/join as a provider/i);
  });

  it('provider card has no nested anchor elements', () => {
    render(<LandingPage />);
    const providerCard = screen.getByRole('link', { name: /for providers/i });
    expect(providerCard.querySelectorAll('a')).toHaveLength(0);
  });
});
