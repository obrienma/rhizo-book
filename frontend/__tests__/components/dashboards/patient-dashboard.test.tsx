import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';
import PatientDashboard from '@/components/dashboards/patient-dashboard';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn() },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const SESSION = {
  data: {
    user: { name: 'Jane', roleName: 'patient', email: 'j@test.com', id: '1', roleId: 1, accessToken: 'tok' },
    expires: '',
  },
  status: 'authenticated' as const,
  update: vi.fn(),
};

const makeAppointment = (id: number, status: string, providerName: string, startTime = '2026-03-01T10:00:00Z') => ({
  id,
  startTime,
  endTime: '2026-03-01T10:30:00Z',
  status,
  provider: { name: providerName, email: 'p@test.com' },
});

describe('PatientDashboard', () => {
  beforeEach(() => {
    vi.mocked(useSession).mockReturnValue(SESSION);
  });

  it('shows loading state initially', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    render(<PatientDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows empty state when there are no appointments', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    render(<PatientDashboard />);
    await waitFor(() =>
      expect(screen.getByText(/no upcoming appointments/i)).toBeInTheDocument()
    );
  });

  it('filters out non-SCHEDULED appointments', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [
        makeAppointment(1, 'CANCELLED', 'Adams'),
        makeAppointment(2, 'COMPLETED', 'Jones'),
      ],
    });
    render(<PatientDashboard />);
    await waitFor(() =>
      expect(screen.getByText(/no upcoming appointments/i)).toBeInTheDocument()
    );
  });

  it('renders scheduled appointments with provider name and status badge', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [makeAppointment(1, 'SCHEDULED', 'Adams')],
    });
    render(<PatientDashboard />);
    await waitFor(() => expect(screen.getByText('Dr. Adams')).toBeInTheDocument());
    expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
  });

  it('shows Book Appointment link pointing to /providers', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    render(<PatientDashboard />);
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /book appointment/i })).toHaveAttribute('href', '/providers')
    );
  });

  it('shows welcome message with user name', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    render(<PatientDashboard />);
    await waitFor(() => expect(screen.getByText(/jane/i)).toBeInTheDocument());
  });
});
