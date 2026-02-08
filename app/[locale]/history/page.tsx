'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Trash2, Clock, RotateCcw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LatexBlock } from '@/components/math/latex-display'
import { useHistory } from '@/lib/hooks/use-history'

const RESTORE_KEY = 'restore-calculation'

export default function HistoryPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { history, isLoading, removeEntry, clearHistory } = useHistory()
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp))
  }

  const getMethodName = (type: string) => {
    return t(`methods.${type}`)
  }

  const isApproximation = (type: string) => type.includes('approximation')

  const handleRestore = (entry: typeof history[number]) => {
    sessionStorage.setItem(RESTORE_KEY, JSON.stringify({
      points: entry.points,
      type: entry.type,
    }))
    const page = isApproximation(entry.type) ? 'approximation' : 'interpolation'
    router.push(`/${locale}/${page}`)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('history.title')}</h1>
          <p className="text-muted-foreground">{t('history.subtitle')}</p>
        </div>

        {history.length > 0 && (
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowConfirmClear(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('history.clearAll')}
            </Button>

            {showConfirmClear && (
              <div className="absolute right-0 top-full mt-2 p-4 bg-card border border-border rounded-lg shadow-lg z-10 w-64">
                <p className="text-sm mb-3">{t('history.confirmClear')}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      clearHistory()
                      setShowConfirmClear(false)
                    }}
                  >
                    {t('common.yes')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConfirmClear(false)}
                  >
                    {t('common.no')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {history.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">{t('history.empty')}</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t('history.emptyDesc')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* History entries */}
      <div className="space-y-4">
        {history.map((entry) => (
          <Card key={entry.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    {getMethodName(entry.type)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" />
                    {t('history.savedAt')}: {formatDate(entry.timestamp)}
                    <span className="mx-1">·</span>
                    {t('history.points', { count: entry.points.length })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRestore(entry)}
                    className="text-muted-foreground hover:text-primary"
                    title={t('history.restore')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                    className="text-muted-foreground hover:text-destructive"
                    title={t('history.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              {/* Polynomial */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('results.polynomial')}:
                </p>
                <LatexBlock latex={entry.result.polynomial} />
              </div>

              {/* Data summary */}
              <div className="flex flex-wrap gap-4 text-sm">
                {'rSquared' in entry.result &&
                  entry.result.rSquared !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">R²:</span>
                      <span className="font-mono">
                        {(entry.result.rSquared * 100).toFixed(2)}%
                      </span>
                    </div>
                  )}
              </div>

              {/* Coefficients */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('approximation.coefficients')}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {entry.result.coefficients.map((coef, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-mono"
                    >
                      a<sub>{i}</sub>={coef.toFixed(4)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data points preview */}
              <details className="text-sm">
                <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                  {t('input.dataPoints')} ({entry.points.length})
                </summary>
                <div className="mt-2 p-2 bg-secondary/50 rounded-lg overflow-x-auto">
                  <table className="data-table text-xs">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>x</th>
                        <th>y</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.points.slice(0, 10).map((point, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td className="font-mono">{point.x}</td>
                          <td className="font-mono">{point.y}</td>
                        </tr>
                      ))}
                      {entry.points.length > 10 && (
                        <tr>
                          <td colSpan={3} className="text-muted-foreground">
                            ... and {entry.points.length - 10} more
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
