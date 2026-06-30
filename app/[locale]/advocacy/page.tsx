import { getDictionary } from '@/lib/dictionaries';
import AdvocacyDashboard from '@/components/AdvocacyDashboard';
import type { Locale } from \'@/lib/app-config\';

export default async function AdvocacyPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale || 'en';
  const dict = await getDictionary(locale as Locale);
  const pathname = '/advocacy';
  const timezone = 'America/Los_Angeles';

  return (
    <AdvocacyDashboard 
      dict={dict}
      locale={locale as Locale}
      timezone={timezone}
      pathname={pathname}
    />
  );
}
