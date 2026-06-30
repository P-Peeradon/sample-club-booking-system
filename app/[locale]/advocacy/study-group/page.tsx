import { getDictionary } from '@/lib/dictionaries';
import StudyGroupDashboard from '@/components/StudyGroupDashboard';

export default async function StudyGroupPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale || 'en';
  const dict = await getDictionary(locale as any);
  const pathname = '/advocacy/study-group';
  const timezone = 'America/Los_Angeles';

  return (
    <StudyGroupDashboard 
      dict={dict} 
      locale={locale as any} 
      timezone={timezone} 
      pathname={pathname} 
    />
  );
}
