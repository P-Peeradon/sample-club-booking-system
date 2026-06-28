import { headers } from 'next/headers';
import { getDictionary } from '@/lib/dictionaries';
import GlobalSettingsSwitcher from '@/components/GlobalSettingsSwitcher';
import RegisterForm from './RegisterForm';

export default async function RegisterPage() {
  const headerList = await headers();
  const locale = (headerList.get('x-locale') || 'en') as any;
  const timezone = (headerList.get('x-timezone') || 'America/Los_Angeles') as any;
  const pathname = headerList.get('x-pathname') || '/register';
  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen py-12 px-4 flex flex-col items-center justify-center bg-linear-to-b from-[#e6f4fe] to-[#f0f7ff]">
      <div className="absolute top-4 right-4 z-50">
        <GlobalSettingsSwitcher dict={dict} currentLocale={locale} currentTimezone={timezone} currentPathname={pathname} />
      </div>
      <RegisterForm locale={locale} />
    </main>
  );
}
