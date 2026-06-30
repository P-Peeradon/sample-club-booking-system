import { getDictionary } from '@/lib/dictionaries';
import GlobalSettingsSwitcher from '@/components/GlobalSettingsSwitcher';
import LoginForm from './LoginForm';

export default async function LoginPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale || 'en';
  const dict = await getDictionary(locale as any);
  const pathname = '/login';
  const timezone = 'America/Los_Angeles';

  return (
    <main className="min-h-screen py-12 px-4 flex flex-col items-center justify-center bg-linear-to-b from-[#e6f4fe] to-[#f0f7ff]">
      <div className="absolute top-4 right-4 z-50">
        <GlobalSettingsSwitcher dict={dict} currentLocale={locale as any} currentTimezone={timezone} currentPathname={pathname} />
      </div>
      <LoginForm locale={locale} dict={dict} />
    </main>
  );
}
