import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import RegisterPage from '@/app/register/page';

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  default: { post: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe('RegisterPage', () => {
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
    vi.mocked(api.post).mockClear();
    vi.mocked(signIn).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it('renders all fields and the submit button', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join the network/i })).toBeInTheDocument();
  });

  it('shows error when name is too short', async () => {
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'ab');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /join the network/i }));
    await waitFor(() =>
      expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument()
    );
  });

  it('shows error for invalid email', async () => {
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /join the network/i }));
    await waitFor(() =>
      expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
    );
  });

  it('shows error when passwords do not match', async () => {
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different456');
    await userEvent.click(screen.getByRole('button', { name: /join the network/i }));
    await waitFor(() =>
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    );
  });

  it('submits correct payload and redirects to /dashboard on success', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    vi.mocked(signIn).mockResolvedValue({ error: null, ok: true, status: 200, url: '/dashboard' });
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /join the network/i }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'password123',
        roleId: 2,
      });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects to /login when signIn fails after successful registration', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    vi.mocked(signIn).mockResolvedValue({ error: 'CredentialsSignin', ok: false, status: 401, url: null });
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /join the network/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'));
  });

  it('calls toast.error when api.post fails', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { message: 'Email already in use' } },
    });
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /join the network/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Email already in use')
    );
  });

  it('renders Sign in and Back to home links', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });
});
