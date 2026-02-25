import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface RegistrationValues {
  name: string;
  email: string;
  password: string;
}

interface Router {
  push: (url: string) => void;
  refresh: () => void;
}

/**
 * Shared registration submit handler used by both patient and provider forms.
 * Posts base credentials to /auth/register, then auto-signs in.
 */
export async function submitRegistration(
  values: RegistrationValues,
  roleId: number,
  router: Router,
): Promise<void> {
  try {
    await api.post('/auth/register', {
      name: values.name,
      email: values.email,
      password: values.password,
      roleId,
    });

    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error('Account created — please sign in.');
      router.push('/login');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message;
    toast.error(
      Array.isArray(message) ? message.join(', ') : (message ?? 'Registration failed. Please try again.')
    );
  }
}
