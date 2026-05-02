import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ProviderDashboard from '@/components/dashboards/provider-dashboard';
import PatientDashboard from '@/components/dashboards/patient-dashboard';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return session.user.roleName === 'provider' ? (
    <ProviderDashboard />
  ) : (
    <PatientDashboard />
  );
}
