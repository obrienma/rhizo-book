import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import ProvidersPage from '@/app/(app)/providers/page';

vi.mock('axios', () => ({
  default: { get: vi.fn() },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

beforeEach(() => vi.resetAllMocks());

const makeProvider = (id: number, name: string, specialty: string | null, bio: string | null) => ({
  id,
  name,
  providerProfile: specialty ? { specialty, bio, appointmentDuration: 30 } : null,
});

describe('ProvidersPage', () => {
  it('shows loading state initially', () => {
    vi.mocked(axios.get).mockReturnValue(new Promise(() => {}));
    render(<ProvidersPage />);
    expect(screen.getByText(/finding best-in-class care/i)).toBeInTheDocument();
  });

  it('renders provider cards with name and specialty', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: [makeProvider(1, 'Adams', 'Cardiology', 'Expert cardiologist with over 20 years of experience.')],
    });
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByText('Dr. Adams')).toBeInTheDocument());
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
  });

  it('falls back to "General Practice" when providerProfile is null', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: [makeProvider(2, 'Jones', null, null)],
    });
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByText('General Practice')).toBeInTheDocument());
  });

  it('renders a View Availability link pointing to the provider detail page', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: [makeProvider(3, 'Chen', 'Pediatrics', 'Caring pediatrician focused on child development and wellbeing.')],
    });
    render(<ProvidersPage />);
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /view availability/i })).toHaveAttribute('href', '/providers/3')
    );
  });

  it('renders multiple provider cards', async () => {
    vi.mocked(axios.get).mockResolvedValue({
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
