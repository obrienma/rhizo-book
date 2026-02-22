import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';
import ProviderDashboard from '@/components/dashboards/provider-dashboard';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn() },
}));

const SESSION = {
  data: {
    user: { name: 'Smith', roleName: 'provider', email: 's@test.com', id: '2', roleId: 2, accessToken: 'tok' },
    expires: '',
  },
  status: 'authenticated' as const,
  update: vi.fn(),
};

const makeAppointment = (id: number, status: string, patientName: string, startTime = '2026-03-01T10:00:00Z') => ({
  id,
  startTime,
  endTime: '2026-03-01T10:30:00Z',
  status,
  patient: { name: patientName, email: 'p@test.com' },
});

describe('ProviderDashboard', () => {
  beforeEach(() => {
    vi.mocked(useSession).mockReturnValue(SESSION);
  });

  it('shows loading state initially', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    render(<ProviderDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows empty state when there are no scheduled appointments', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    render(<ProviderDashboard />);
    await waitFor(() =>
      expect(screen.getByText(/no upcoming appointments/i)).toBeInTheDocument()
    );
  });

  it('filters out non-SCHEDULED appointments', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [makeAppointment(1, 'COMPLETED', 'Old Patient')],
    });
    render(<ProviderDashboard />);
    await waitFor(() =>
      expect(screen.getByText(/no upcoming appointments/i)).toBeInTheDocument()
    );
  });

  it('renders scheduled appointments with patient name and status badge', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [makeAppointment(1, 'SCHEDULED', 'Jane Doe')],
    });
    render(<ProviderDashboard />);
    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument());
    expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
  });

  it('shows welcome message with provider name', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    render(<ProviderDashboard />);
    await waitFor(() => expect(screen.getByText(/dr\. smith/i)).toBeInTheDocument());
  });
});
