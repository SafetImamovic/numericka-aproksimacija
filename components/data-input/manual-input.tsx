'use client'

import { useCallback, useState } from 'react'
import { Trash2, ClipboardCopy, ClipboardPaste } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataPointInput } from '@/components/math/data-point-input'
import { parseCSV, parseJSON } from '@/lib/math/validators'
import type { DataPoint } from '@/lib/types'

interface ManualInputProps {
  points: DataPoint[]
  onChange: (points: DataPoint[]) => void
  errors?: Map<number, { x?: string; y?: string }>
  disabled?: boolean
  translations: {
    xValue: string
    yValue: string
    addRow: string
    clearAll: string
    point: string
    copyData: string
    pasteData: string
    pastedPoints: string
    copiedPoints: string
  }
}

export function ManualInput({
  points,
  onChange,
  errors,
  disabled = false,
  translations,
}: ManualInputProps) {
  const [feedback, setFeedback] = useState<string | null>(null)

  const showFeedback = useCallback((message: string) => {
    setFeedback(message)
    setTimeout(() => setFeedback(null), 2000)
  }, [])

  const clearAll = useCallback(() => {
    onChange([{ x: NaN, y: NaN }, { x: NaN, y: NaN }])
  }, [onChange])

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const text = e.clipboardData.getData('text/plain')
      if (!text.includes('\n') && !text.includes('\t')) return // single value, let native handle

      let parsed = parseCSV(text)
      if (parsed.length < 2) parsed = parseJSON(text)

      if (parsed.length >= 2) {
        e.preventDefault()
        e.stopPropagation()
        onChange(parsed)
        showFeedback(translations.pastedPoints.replace('{count}', String(parsed.length)))
      }
    },
    [onChange, showFeedback, translations.pastedPoints]
  )

  const handleCopy = useCallback(async () => {
    const validPoints = points.filter((p) => !isNaN(p.x) && !isNaN(p.y))
    if (validPoints.length === 0) return

    const csv = validPoints.map((p) => `${p.x},${p.y}`).join('\n')
    await navigator.clipboard.writeText(csv)
    showFeedback(translations.copiedPoints)
  }, [points, showFeedback, translations.copiedPoints])

  const handlePasteButton = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      let parsed = parseCSV(text)
      if (parsed.length < 2) parsed = parseJSON(text)

      if (parsed.length >= 2) {
        onChange(parsed)
        showFeedback(translations.pastedPoints.replace('{count}', String(parsed.length)))
      }
    } catch {
      // Clipboard access denied — ignore silently
    }
  }, [onChange, showFeedback, translations.pastedPoints])

  return (
    <div className="space-y-4" onPaste={handlePaste}>
      <DataPointInput
        points={points}
        onChange={onChange}
        errors={errors}
        disabled={disabled}
        labels={{
          xValue: translations.xValue,
          yValue: translations.yValue,
          addRow: translations.addRow,
          point: translations.point,
        }}
      />

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground"
        >
          <ClipboardCopy className="h-4 w-4 mr-2" />
          {translations.copyData}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePasteButton}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground"
        >
          <ClipboardPaste className="h-4 w-4 mr-2" />
          {translations.pasteData}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          disabled={disabled}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {translations.clearAll}
        </Button>
        {feedback && (
          <span className="text-sm text-green-500 animate-in fade-in duration-200">
            {feedback}
          </span>
        )}
      </div>
    </div>
  )
}
