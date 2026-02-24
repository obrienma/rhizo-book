import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/login/page';

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('LoginPage', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    mockPush.mockClear();
    mockRefresh.mockClear();
  });

  it('renders email, password fields and Sign In button', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error message on failed sign in', async () => {
    vi.mocked(signIn).mockResolvedValue({ error: 'CredentialsSignin', ok: false, status: 401, url: null });
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'bad@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByText(/incorrect email or password/i)).toBeInTheDocument()
    );
  });

  it('shows zod error for invalid email format', async () => {
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/password/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
    );
  });

  it('shows zod error when password is empty', async () => {
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'patient@test.com');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    );
  });

  it('renders Register and Back to home links', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  it('redirects to /dashboard on successful sign in', async () => {
    vi.mocked(signIn).mockResolvedValue({ error: null, ok: true, status: 200, url: '/dashboard' });
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'patient@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'));
  });

  it('disables button and shows "Signing in..." while loading', async () => {
    let resolveSignIn!: (v: unknown) => void;
    vi.mocked(signIn).mockReturnValue(new Promise((res) => { resolveSignIn = res; }) as ReturnType<typeof signIn>);
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'patient@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    await act(async () => {
      resolveSignIn({ error: null, ok: true, status: 200, url: '/dashboard' });
    });
  });
});
