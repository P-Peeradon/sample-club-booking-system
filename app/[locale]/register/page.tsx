import { getDictionary } from '@/lib/dictionaries';
import GlobalSettingsSwitcher from '@/components/GlobalSettingsSwitcher';
import RegisterForm from './RegisterForm';

export default async function RegisterPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale || 'en';
  const dict = await getDictionary(locale as any);
  const pathname = '/register';
  const timezone = 'America/Los_Angeles';

  return (
    <main className="min-h-screen py-12 px-4 flex flex-col items-center justify-center bg-linear-to-b from-[#e6f4fe] to-[#f0f7ff]">
      <div className="absolute top-4 right-4 z-50">
        <GlobalSettingsSwitcher dict={dict} currentLocale={locale as any} currentTimezone={timezone} currentPathname={pathname} />
      </div>
      <RegisterForm locale={locale} />
    </main>
  );
}
