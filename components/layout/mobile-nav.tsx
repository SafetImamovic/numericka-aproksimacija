'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Calculator, TrendingUp, GitBranch, History, Sigma } from 'lucide-react'

interface MobileNavProps {
  translations: {
    home: string
    approximation: string
    interpolation: string
    linearSystems: string
    history: string
  }
}

export function MobileNav({ translations }: MobileNavProps) {
  const pathname = usePathname()
  const locale = useLocale()

  const navItems = [
    {
      href: `/${locale}`,
      label: translations.home,
      icon: Calculator,
    },
    {
      href: `/${locale}/approximation`,
      label: translations.approximation,
      icon: TrendingUp,
    },
    {
      href: `/${locale}/interpolation`,
      label: translations.interpolation,
      icon: GitBranch,
    },
    {
      href: `/${locale}/linear-systems`,
      label: translations.linearSystems,
      icon: Sigma,
    },
    {
      href: `/${locale}/history`,
      label: translations.history,
      icon: History,
    },
  ]

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-3 min-w-[60px] transition-colors
                ${active ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
