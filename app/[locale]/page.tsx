'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { TrendingUp, GitBranch, History, ArrowRight, Github, ExternalLink } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { LatexDisplay } from '@/components/math/latex-display'

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

      {/* Open source banner */}
      <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
        <Github className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-0.5">{t('openSource')}</p>
          <p className="text-sm text-muted-foreground">{t('openSourceDesc')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('openSourceIssue')}</p>
        </div>
        <a
          href="https://github.com/SafetImamovic/numericka-aproksimacija"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-border hover:border-primary/50 hover:bg-accent transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t('viewOnGitHub')}
        </a>
      </div>

      {/* Quick formulas preview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('quickReference')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 bg-background rounded-lg border border-border">
              <h4 className="font-medium mb-2 text-green-400">{t('leastSquares')}</h4>
              <div className="overflow-x-auto">
                <LatexDisplay latex="S = \sum_{i=1}^{n} \left( y_i - P(x_i) \right)^2 \to \min" displayMode />
              </div>
            </div>
            <div className="p-4 bg-background rounded-lg border border-border">
              <h4 className="font-medium mb-2 text-blue-400">{t('lagrangeBasis')}</h4>
              <div className="overflow-x-auto">
                <LatexDisplay latex="L_k(x) = \prod_{\substack{i=0 \\ i \neq k}}^{n} \frac{x - x_i}{x_k - x_i}" displayMode />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
