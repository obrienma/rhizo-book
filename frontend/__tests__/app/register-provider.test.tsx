import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import ProviderRegisterPage from '@/app/register/provider/page';

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

describe('ProviderRegisterPage', () => {
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

  it('renders all required and optional fields', () => {
    render(<ProviderRegisterPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/specialty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/license number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/appointment duration/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join as a provider/i })).toBeInTheDocument();
  });

  it('optional fields have the profile-later placeholder', () => {
    render(<ProviderRegisterPage />);
    const placeholderText = 'You can update this from your profile later';
    const fields = screen.getAllByPlaceholderText(placeholderText, { exact: false });
    expect(fields.length).toBeGreaterThanOrEqual(3);
  });

  it('shows zod error when name is too short', async () => {
    render(<ProviderRegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'ab');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'dr@clinic.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /join as a provider/i }));
    await waitFor(() =>
      expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument()
    );
  });

  it('shows zod error for invalid email', async () => {
    render(<ProviderRegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Dr. Smith');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /join as a provider/i }));
    await waitFor(() =>
      expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
    );
  });

  it('shows zod error when passwords do not match', async () => {
    render(<ProviderRegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Dr. Smith');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'dr@clinic.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different456');
    await userEvent.click(screen.getByRole('button', { name: /join as a provider/i }));
    await waitFor(() =>
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    );
  });

  it('submits with roleId 1 and only base fields, then redirects to /dashboard', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    vi.mocked(signIn).mockResolvedValue({ error: null, ok: true, status: 200, url: '/dashboard' });
    render(<ProviderRegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Dr. Smith');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'dr@clinic.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /join as a provider/i }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Dr. Smith',
        email: 'dr@clinic.com',
        password: 'password123',
        roleId: 1,
      });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects to /login when signIn fails after successful registration', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    vi.mocked(signIn).mockResolvedValue({ error: 'CredentialsSignin', ok: false, status: 401, url: null });
    render(<ProviderRegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Dr. Smith');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'dr@clinic.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /join as a provider/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'));
  });

  it('calls toast.error when api.post fails', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { message: 'Email already registered' } },
    });
    render(<ProviderRegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Dr. Smith');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'dr@clinic.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /join as a provider/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Email already registered')
    );
  });

  it('renders Sign in and Back to home links', () => {
    render(<ProviderRegisterPage />);
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });
});
