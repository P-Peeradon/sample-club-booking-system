import { getDictionary } from '@/lib/dictionaries';
import DashboardClient from '@/components/DashboardClient';
import { Suspense } from 'react';

export default async function Dashboard(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale || 'en';
  const dict = await getDictionary(locale as any);
  const pathname = '/dashboard';

  // In Tauri Next.js apps, search parameters must be handled client-side
  // via useSearchParams hook in the client component.
  
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold">Loading...</div>}>
      <DashboardClient dict={dict} locale={locale as any} pathname={pathname} />
    </Suspense>
  );
}
