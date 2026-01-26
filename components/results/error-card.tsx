'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ApproximationResult, InterpolationResult } from '@/lib/types'

interface ErrorCardProps {
    result: ApproximationResult | InterpolationResult
    translations: {
        rSquared?: string
        sumSquaredError?: string
        absoluteError?: string
        relativeError?: string
        pointErrors?: string
        resultsTitle: string
    }
}

export function ErrorCard({ result, translations }: ErrorCardProps) {
    const isApproximation = 'rSquared' in result
    const hasPointErrors = result.pointErrors && result.pointErrors.length > 0

    if (!isApproximation && !hasPointErrors) return null

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    {translations.pointErrors || 'Greške'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Global Metrics (Approximation only) */}
                {isApproximation && (
                    <div className="grid grid-cols-2 gap-4">
                        {(result as ApproximationResult).rSquared !== undefined && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                    {translations.rSquared}
                                </p>
                                <p className="text-lg font-mono font-semibold text-primary">
                                    {((result as ApproximationResult).rSquared! * 100).toFixed(2)}%
                                </p>
                            </div>
                        )}
                        {(result as ApproximationResult).sumSquaredError !== undefined && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                    {translations.sumSquaredError}
                                </p>
                                <p className="text-lg font-mono font-semibold text-primary">
                                    {(result as ApproximationResult).sumSquaredError!.toPrecision(6)}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Point-wise Errors */}
                {hasPointErrors && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {translations.pointErrors || 'Detaljne greške po tačkama'}
                        </h4>
                        <div className="overflow-x-auto border border-border rounded-lg">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border text-[10px] uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-center">x</th>
                                        <th className="px-3 py-2 text-center">y</th>
                                        <th className="px-3 py-2">{translations.absoluteError || 'Abs Error'}</th>
                                        <th className="px-3 py-2">{translations.relativeError || 'Rel Error'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border font-mono">
                                    {result.pointErrors!.map((err, i) => (
                                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-3 py-2 text-center text-muted-foreground">{result.points[i].x}</td>
                                            <td className="px-3 py-2 text-center text-muted-foreground">{result.points[i].y}</td>
                                            <td className="px-3 py-2 text-blue-400 font-medium">{err.absolute.toPrecision(4)}</td>
                                            <td className="px-3 py-2 text-orange-400 font-medium">{(err.relative * 100).toFixed(4)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
