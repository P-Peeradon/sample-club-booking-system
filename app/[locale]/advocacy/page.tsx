import { getDictionary } from '@/lib/dictionaries';
import AdvocacyDashboard from '@/components/AdvocacyDashboard';

export default async function AdvocacyPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale || 'en';
  const dict = await getDictionary(locale as any);
  const pathname = '/advocacy';
  const timezone = 'America/Los_Angeles';

  return (
    <AdvocacyDashboard 
      dict={dict}
      locale={locale as any}
      timezone={timezone}
      pathname={pathname}
    />
  );
}
