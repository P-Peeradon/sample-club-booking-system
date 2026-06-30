import { getDictionary } from '@/lib/dictionaries';
import HomeClient from '@/components/HomeClient';
import type { Locale } from \'@/lib/app-config\';

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale || 'en';
  const dict = await getDictionary(locale as Locale);
  const pathname = '/';

  return <HomeClient dict={dict} locale={locale as Locale} pathname={pathname} />;
}
