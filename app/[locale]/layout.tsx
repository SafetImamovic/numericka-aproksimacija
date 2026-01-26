import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/app/i18n/routing'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'

export const metadata: Metadata = {
  title: 'Numerical Approximation | PNMuSI',
  description: 'Numerical methods for approximation and interpolation - PNMuSI Course',
}

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  // Validate locale
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound()
  }

  // Get messages for the current locale
  const messages = await getMessages()

  const navTranslations = {
    appName: (messages as Record<string, Record<string, string>>).common?.appName || 'Numerical Approximation',
    home: (messages as Record<string, Record<string, string>>).nav?.home || 'Home',
    approximation: (messages as Record<string, Record<string, string>>).nav?.approximation || 'Approximation',
    interpolation: (messages as Record<string, Record<string, string>>).nav?.interpolation || 'Interpolation',
    history: (messages as Record<string, Record<string, string>>).nav?.history || 'History',
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen flex flex-col">
        <Navbar translations={navTranslations} />
        <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
          {children}
        </main>
        <MobileNav translations={navTranslations} />
      </div>
    </NextIntlClientProvider>
  )
}
