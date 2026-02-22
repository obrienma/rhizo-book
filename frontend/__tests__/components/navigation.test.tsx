import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession, signOut } from 'next-auth/react';
import Navigation from '@/components/navigation';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const makeSession = (roleName: string, name: string) => ({
  data: {
    user: { name, roleName, email: 'u@test.com', id: '1', roleId: 1, accessToken: 'tok' },
    expires: '',
  },
  status: 'authenticated' as const,
  update: vi.fn(),
});

describe('Navigation', () => {
  it('renders nothing when unauthenticated', () => {
    vi.mocked(useSession).mockReturnValue({ data: null, status: 'unauthenticated', update: vi.fn() });
    const { container } = render(<Navigation />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows app name, Dashboard link, user name and Sign Out when authenticated', () => {
    vi.mocked(useSession).mockReturnValue(makeSession('provider', 'Dr. Smith'));
    render(<Navigation />);
    expect(screen.getByText('Health Scheduler')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('shows Providers link for patients', () => {
    vi.mocked(useSession).mockReturnValue(makeSession('patient', 'Jane'));
    render(<Navigation />);
    expect(screen.getByText('Providers')).toBeInTheDocument();
  });

  it('hides Providers link for providers', () => {
    vi.mocked(useSession).mockReturnValue(makeSession('provider', 'Dr. Smith'));
    render(<Navigation />);
    expect(screen.queryByText('Providers')).not.toBeInTheDocument();
  });

  it('calls signOut when Sign Out is clicked', async () => {
    vi.mocked(useSession).mockReturnValue(makeSession('patient', 'Jane'));
    render(<Navigation />);
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(signOut).toHaveBeenCalled();
  });
});
