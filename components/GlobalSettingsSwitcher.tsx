'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { locales } from '@/lib/app-config';
import type { Locale, Timezone } from '@/lib/app-config';

interface Props {
  currentLocale: Locale;
  currentTimezone: Timezone;
  dict: any;
  currentPathname: string;
}

export default function GlobalSettingsSwitcher({ currentLocale, currentTimezone, dict, currentPathname }: Props) {
  const router = useRouter();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale;
    document.cookie = `USER_LOCALE=${newLocale}; path=/; max-age=31536000`;
    
    // Replace the current locale in the URL path
    const segments = currentPathname.split('/');
    if (segments.length > 1 && locales.includes(segments[1] as any)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/') || '/');
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTz = e.target.value as Timezone;
    document.cookie = `USER_TIMEZONE=${newTz}; path=/; max-age=31536000`;
    router.refresh(); // Refresh current page to apply new timezone from headers
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/20 p-2 rounded-xl border border-white/30 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <label className="text-sm font-bold text-white drop-shadow-md">
          {dict.common.language}:
        </label>
        <div className="relative">
          {currentLocale === 'en' && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm">🇺🇸</span>}
          {currentLocale === 'zh' && <Image src="/china_flag.png" width={24} height={16} alt="China" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-sm border border-slate-300" />}
          {currentLocale === 'fj' && <Image src="/fiji_flag.png" width={24} height={16} alt="Fiji" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-sm border border-slate-300" />}
          
          <select 
            title={dict.common.language}
            value={currentLocale} 
            onChange={handleLanguageChange}
            className="pl-10 pr-4 py-1.5 bg-white text-elmore-dark font-bold rounded-lg border-2 border-elmore-dark cursor-pointer shadow-sm text-sm"
          >
            <option value="en">English (US)</option>
            <option value="zh">中文 (Mandarin)</option>
            <option value="fj">Vosa Vakaviti</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-bold text-white drop-shadow-md">
          {dict.common.timezone}:
        </label>
        <select 
          title={dict.common.timezone}
          value={currentTimezone} 
          onChange={handleTimezoneChange}
          className="px-4 py-1.5 bg-white text-elmore-dark font-bold rounded-lg border-2 border-elmore-dark cursor-pointer shadow-sm text-sm"
        >
          <option value="America/Los_Angeles">Los Angeles (Default)</option>
          <option value="Asia/Shanghai">Beijing</option>
          <option value="America/New_York">Washington DC</option>
          <option value="Pacific/Fiji">Suva</option>
        </select>
      </div>
    </div>
  );
}
