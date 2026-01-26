'use client'

import { useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataPointInput } from '@/components/math/data-point-input'
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
  }
}

export function ManualInput({
  points,
  onChange,
  errors,
  disabled = false,
  translations,
}: ManualInputProps) {
  const clearAll = useCallback(() => {
    onChange([{ x: NaN, y: NaN }, { x: NaN, y: NaN }])
  }, [onChange])

  return (
    <div className="space-y-4">
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

      <Button
        variant="ghost"
        onClick={clearAll}
        disabled={disabled}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {translations.clearAll}
      </Button>
    </div>
  )
}
