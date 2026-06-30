import { getDictionary } from '@/lib/dictionaries';
import StudyGroupDashboard from '@/components/StudyGroupDashboard';
import type { Locale } from \'@/lib/app-config\';

export default async function StudyGroupPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale || 'en';
  const dict = await getDictionary(locale as Locale);
  const pathname = '/advocacy/study-group';
  const timezone = 'America/Los_Angeles';

  return (
    <StudyGroupDashboard 
      dict={dict} 
      locale={locale as Locale} 
      timezone={timezone} 
      pathname={pathname} 
    />
  );
}
