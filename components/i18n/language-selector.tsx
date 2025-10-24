"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Globe, Check } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config';

interface LanguageSelectorProps {
  className?: string;
  showFlag?: boolean;
  showName?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

export function LanguageSelector({ 
  className, 
  showFlag = true, 
  showName = true,
  variant = 'default' 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;

  const handleLanguageChange = (locale: Locale) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
    
    // Add the new locale to the pathname
    const newPath = `/${locale}${pathWithoutLocale}`;
    
    router.push(newPath);
    setIsOpen(false);
  };

  const currentLanguage = {
    code: currentLocale,
    name: localeNames[currentLocale],
    flag: localeFlags[currentLocale],
  };

  if (variant === 'minimal') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn('h-8 w-8 p-0', className)}>
            <Globe className="h-4 w-4" />
            <span className="sr-only">Change language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              className="flex items-center gap-2"
            >
              {showFlag && (
                <span className="text-lg">{localeFlags[locale]}</span>
              )}
              {showName && (
                <span className="flex-1">{localeNames[locale]}</span>
              )}
              {locale === currentLocale && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn('gap-2', className)}>
            {showFlag && <span className="text-sm">{currentLanguage.flag}</span>}
            {showName && <span className="text-sm">{currentLanguage.name}</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              className="flex items-center gap-2"
            >
              {showFlag && (
                <span className="text-lg">{localeFlags[locale]}</span>
              )}
              {showName && (
                <span className="flex-1">{localeNames[locale]}</span>
              )}
              {locale === currentLocale && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Globe className="h-4 w-4" />
          {showFlag && <span className="text-lg">{currentLanguage.flag}</span>}
          {showName && <span>{currentLanguage.name}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
          Select Language
        </div>
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className="flex items-center gap-3 cursor-pointer"
          >
            {showFlag && (
              <span className="text-xl">{localeFlags[locale]}</span>
            )}
            <div className="flex-1">
              <div className="font-medium">{localeNames[locale]}</div>
              <div className="text-xs text-muted-foreground">
                {locale.toUpperCase()}
              </div>
            </div>
            {locale === currentLocale && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
