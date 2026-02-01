'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ErrorPlot } from './error-plot'
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
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>{translations.pointErrors || 'Greške'}</span>
                    {/* Global Metrics (Approximation only) */}
                    {isApproximation && (
                        <div className="flex gap-4">
                            {(result as ApproximationResult).rSquared !== undefined && (
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                        {translations.rSquared}
                                    </p>
                                    <p className="text-sm font-mono font-semibold text-primary">
                                        {((result as ApproximationResult).rSquared! * 100).toFixed(2)}%
                                    </p>
                                </div>
                            )}
                            {(result as ApproximationResult).sumSquaredError !== undefined && (
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                        {translations.sumSquaredError}
                                    </p>
                                    <p className="text-sm font-mono font-semibold text-primary">
                                        {(result as ApproximationResult).sumSquaredError!.toPrecision(6)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Error Plot */}
                {hasPointErrors && (
                    <ErrorPlot
                        points={result.points}
                        errors={result.pointErrors!}
                        height={250}
                        translations={{
                            absoluteError: translations.absoluteError || 'Absolute Error',
                            relativeError: translations.relativeError || 'Relative Error',
                        }}
                    />
                )}

                {/* Point-wise Errors Table */}
                {hasPointErrors && (
                    <div className="overflow-x-auto border border-border rounded-lg max-h-[200px] overflow-y-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border text-[10px] uppercase sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-center">x</th>
                                    <th className="px-3 py-2 text-center">y</th>
                                    <th className="px-3 py-2 text-center">P(x)</th>
                                    <th className="px-3 py-2">{translations.absoluteError || 'Abs Error'}</th>
                                    <th className="px-3 py-2">{translations.relativeError || 'Rel Error'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-mono">
                                {result.pointErrors!.map((err, i) => {
                                    const predicted = result.points[i].y - err.absolute
                                    return (
                                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-3 py-2 text-center text-muted-foreground">{result.points[i].x.toFixed(4)}</td>
                                            <td className="px-3 py-2 text-center text-muted-foreground">{result.points[i].y.toFixed(4)}</td>
                                            <td className="px-3 py-2 text-center text-green-400">{predicted.toFixed(4)}</td>
                                            <td className="px-3 py-2 text-blue-400 font-medium">{err.absolute.toPrecision(4)}</td>
                                            <td className="px-3 py-2 text-orange-400 font-medium">{(err.relative * 100).toFixed(4)}%</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
