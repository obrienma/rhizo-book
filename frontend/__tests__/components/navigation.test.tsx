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
  describe('unauthenticated', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({ data: null, status: 'unauthenticated', update: vi.fn() });
    });

    it('renders Find Care and Sign In links', () => {
      render(<Navigation />);
      expect(screen.getByRole('link', { name: /find care/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });

    it('does not show Sign Out button', () => {
      render(<Navigation />);
      expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    });
  });

  describe('authenticated', () => {
    it('shows Dashboard, Appointments, user name and Sign Out', () => {
      vi.mocked(useSession).mockReturnValue(makeSession('provider', 'Dr. Smith'));
      render(<Navigation />);
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /appointments/i })).toBeInTheDocument();
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('shows Find Care link for patients', () => {
      vi.mocked(useSession).mockReturnValue(makeSession('patient', 'Jane'));
      render(<Navigation />);
      expect(screen.getByRole('link', { name: /find care/i })).toBeInTheDocument();
    });

    it('hides Find Care link for providers', () => {
      vi.mocked(useSession).mockReturnValue(makeSession('provider', 'Dr. Smith'));
      render(<Navigation />);
      expect(screen.queryByRole('link', { name: /find care/i })).not.toBeInTheDocument();
    });

    it('calls signOut with window.location.origin as callbackUrl', async () => {
      vi.mocked(useSession).mockReturnValue(makeSession('patient', 'Jane'));
      render(<Navigation />);
      await userEvent.click(screen.getByRole('button', { name: /sign out/i }));
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: window.location.origin });
    });
  });
});
