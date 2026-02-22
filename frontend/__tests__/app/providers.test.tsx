import { render, screen, waitFor } from '@testing-library/react';
import api from '@/lib/api';
import ProvidersPage from '@/app/providers/page';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn() },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const makeProvider = (id: number, name: string, specialty: string | null, bio: string | null) => ({
  id,
  name,
  email: `${name.toLowerCase()}@test.com`,
  providerProfile: specialty ? { specialty, bio } : null,
});

describe('ProvidersPage', () => {
  it('shows loading state initially', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    render(<ProvidersPage />);
    expect(screen.getByText(/loading providers/i)).toBeInTheDocument();
  });

  it('renders provider cards with name and specialty', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [makeProvider(1, 'Adams', 'Cardiology', 'Expert cardiologist with over 20 years of experience.')],
    });
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByText('Dr. Adams')).toBeInTheDocument());
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
  });

  it('falls back to "General Practice" when providerProfile is null', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [makeProvider(2, 'Jones', null, null)],
    });
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByText('General Practice')).toBeInTheDocument());
  });

  it('renders a View Availability link pointing to the provider detail page', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [makeProvider(3, 'Chen', 'Pediatrics', 'Caring pediatrician focused on child development and wellbeing.')],
    });
    render(<ProvidersPage />);
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /view availability/i })).toHaveAttribute('href', '/providers/3')
    );
  });

  it('renders multiple provider cards', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [
        makeProvider(1, 'Adams', 'Cardiology', 'Cardiologist.'),
        makeProvider(2, 'Jones', 'Neurology', 'Neurologist.'),
      ],
    });
    render(<ProvidersPage />);
    await waitFor(() => {
      expect(screen.getByText('Dr. Adams')).toBeInTheDocument();
      expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    });
  });
});
