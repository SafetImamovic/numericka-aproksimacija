'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/app/i18n/routing'

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'bs', label: 'Bosanski', flag: '🇧🇦' },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = useCallback(
    (newLocale: Locale) => {
      // Remove current locale from pathname and add new one
      const pathWithoutLocale = pathname.replace(/^\/(en|bs)/, '')
      const newPath = `/${newLocale}${pathWithoutLocale || ''}`
      router.push(newPath)
    },
    [pathname, router]
  )

  const currentLanguage = languages.find((l) => l.code === locale) || languages[0]
  const otherLanguage = languages.find((l) => l.code !== locale) || languages[1]

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => switchLanguage(otherLanguage.code)}
      className="flex items-center gap-2"
      title={`Switch to ${otherLanguage.label}`}
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
      <span className="text-muted-foreground">/</span>
      <span className="text-muted-foreground hidden sm:inline">
        {otherLanguage.code.toUpperCase()}
      </span>
    </Button>
  )
}
