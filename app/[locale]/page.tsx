'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { TrendingUp, GitBranch, History, ArrowRight } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()

  const cards = [
    {
      href: `/${locale}/approximation`,
      icon: TrendingUp,
      title: t('approximationCard.title'),
      description: t('approximationCard.description'),
      color: 'text-green-400',
    },
    {
      href: `/${locale}/interpolation`,
      icon: GitBranch,
      title: t('interpolationCard.title'),
      description: t('interpolationCard.description'),
      color: 'text-blue-400',
    },
    {
      href: `/${locale}/history`,
      icon: History,
      title: t('historyCard.title'),
      description: t('historyCard.description'),
      color: 'text-purple-400',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero section */}
      <div className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t('title')}</h1>
        <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
      </div>

      {/* Method cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Link key={card.href} href={card.href} className="group">
              <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-card flex items-center justify-center mb-3 border border-border ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {card.title}
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick formulas preview */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 bg-background rounded-lg border border-border">
              <h4 className="font-medium mb-2 text-green-400">Least Squares</h4>
              <code className="text-xs text-muted-foreground block">
                minimize: S = &Sigma;(y&#x2C7;&#x2D9; - P(x&#x2C7;&#x2D9;))&sup2;
              </code>
            </div>
            <div className="p-4 bg-background rounded-lg border border-border">
              <h4 className="font-medium mb-2 text-blue-400">Lagrange Basis</h4>
              <code className="text-xs text-muted-foreground block">
                L&#x2096;(x) = &Pi;(i&ne;k) (x-x&#x1D62;)/(x&#x2096;-x&#x1D62;)
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
