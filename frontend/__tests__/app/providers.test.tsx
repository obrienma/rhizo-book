import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import ProvidersPage from '@/app/(app)/providers/page';

vi.mock('axios', () => ({
  default: { get: vi.fn() },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockPush = vi.fn();
const defaultOptions = { specialties: [], cities: [], provinces: [] };

const makeProvider = (
  id: number,
  name: string,
  specialty: string | null,
  bio: string | null,
  city?: string | null,
  province?: string | null,
) => ({
  id,
  name,
  providerProfile: specialty
    ? { specialty, bio, city: city ?? null, province: province ?? null, appointmentDuration: 30 }
    : null,
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  });
  vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any);
  vi.mocked(axios.get).mockImplementation((url: string) => {
    if (url === '/v1/providers/options') return Promise.resolve({ data: defaultOptions });
    return Promise.resolve({ data: [] });
  });
});

describe('ProvidersPage', () => {
  it('shows loading state initially', () => {
    vi.mocked(axios.get).mockReturnValue(new Promise(() => {}));
    render(<ProvidersPage />);
    expect(screen.getByText(/finding best-in-class care/i)).toBeInTheDocument();
  });

  it('renders provider cards with name and specialty', async () => {
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url === '/v1/providers/options') return Promise.resolve({ data: defaultOptions });
      return Promise.resolve({
        data: [makeProvider(1, 'Adams', 'Cardiology', 'Expert cardiologist with over 20 years of experience.')],
      });
    });
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByText('Dr. Adams')).toBeInTheDocument());
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
  });

  it('falls back to "General Practice" when providerProfile is null', async () => {
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url === '/v1/providers/options') return Promise.resolve({ data: defaultOptions });
      return Promise.resolve({ data: [makeProvider(2, 'Jones', null, null)] });
    });
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByText('General Practice')).toBeInTheDocument());
  });

  it('renders a View Availability link pointing to the provider detail page', async () => {
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url === '/v1/providers/options') return Promise.resolve({ data: defaultOptions });
      return Promise.resolve({
        data: [makeProvider(3, 'Chen', 'Pediatrics', 'Caring pediatrician focused on child development and wellbeing.')],
      });
    });
    render(<ProvidersPage />);
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /view availability/i })).toHaveAttribute('href', '/providers/3')
    );
  });

  it('renders multiple provider cards', async () => {
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url === '/v1/providers/options') return Promise.resolve({ data: defaultOptions });
      return Promise.resolve({
        data: [
          makeProvider(1, 'Adams', 'Cardiology', 'Cardiologist.'),
          makeProvider(2, 'Jones', 'Neurology', 'Neurologist.'),
        ],
      });
    });
    render(<ProvidersPage />);
    await waitFor(() => {
      expect(screen.getByText('Dr. Adams')).toBeInTheDocument();
      expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    });
  });

  it('displays city and province on provider cards when present', async () => {
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url === '/v1/providers/options') return Promise.resolve({ data: defaultOptions });
      return Promise.resolve({
        data: [makeProvider(1, 'Patel', 'Cardiology', 'Bio.', 'Toronto', 'ON')],
      });
    });
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByText('Toronto, ON')).toBeInTheDocument());
  });

  it('omits location line when city and province are both null', async () => {
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url === '/v1/providers/options') return Promise.resolve({ data: defaultOptions });
      return Promise.resolve({
        data: [makeProvider(1, 'Patel', 'Cardiology', 'Bio.', null, null)],
      });
    });
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByText('Dr. Patel')).toBeInTheDocument());
    expect(screen.queryByText(/,/)).not.toBeInTheDocument();
  });

  it('fetches search options on mount', async () => {
    render(<ProvidersPage />);
    await waitFor(() =>
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/v1/providers/options')
    );
  });

  it('shows empty state without filter copy when no providers and no active filters', async () => {
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByText(/no providers found/i)).toBeInTheDocument());
    expect(screen.queryByText(/no providers match your filters/i)).not.toBeInTheDocument();
  });

  it('shows filter-specific empty state copy when active filters return no results', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('specialty=Podiatry') as any);
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByText(/no providers match your filters/i)).toBeInTheDocument());
  });

  it('shows active filter chips for specialty, city, and province', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('specialty=Cardiology&city=Toronto&province=ON') as any
    );
    render(<ProvidersPage />);
    await waitFor(() => {
      expect(screen.getByText('Cardiology')).toBeInTheDocument();
      expect(screen.getByText('Toronto')).toBeInTheDocument();
      expect(screen.getByText('ON')).toBeInTheDocument();
    });
  });

  it('shows "Showing results for:" label when any filter is active', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('city=Vancouver') as any);
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByText(/showing results for/i)).toBeInTheDocument());
  });

  it('does not show filter chips or label when no search params are set', async () => {
    render(<ProvidersPage />);
    await waitFor(() => screen.getByText(/no providers found/i));
    expect(screen.queryByText(/showing results for/i)).not.toBeInTheDocument();
  });

  it('calls router.push to clear filters when "Clear all" is clicked', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('specialty=Cardiology') as any);
    render(<ProvidersPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(mockPush).toHaveBeenCalledWith('/providers');
  });

  it('shows autocomplete suggestions in SuggestionInput when options are loaded', async () => {
    const options = { specialties: ['Cardiology', 'Neurology', 'Pediatrics'], cities: [], provinces: [] };
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url === '/v1/providers/options') return Promise.resolve({ data: options });
      return Promise.resolve({ data: [] });
    });
    render(<ProvidersPage />);
    const input = await screen.findByPlaceholderText(/search by specialty/i);
    await userEvent.click(input);
    await waitFor(() => expect(screen.getByText('Cardiology')).toBeInTheDocument());
    expect(screen.getByText('Neurology')).toBeInTheDocument();
    expect(screen.getByText('Pediatrics')).toBeInTheDocument();
  });
});
