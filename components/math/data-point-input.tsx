'use client'

import { useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DataPoint } from '@/lib/types'

interface DataPointInputProps {
  points: DataPoint[]
  onChange: (points: DataPoint[]) => void
  errors?: Map<number, { x?: string; y?: string }>
  disabled?: boolean
  labels?: {
    xValue?: string
    yValue?: string
    addRow?: string
    removeRow?: string
    point?: string
  }
}

export function DataPointInput({
  points,
  onChange,
  errors = new Map(),
  disabled = false,
  labels = {},
}: DataPointInputProps) {
  const {
    xValue = 'x',
    yValue = 'y',
    addRow = 'Add Row',
    point: pointLabel = 'Point',
  } = labels

  const handleXChange = useCallback(
    (index: number, value: string) => {
      const newPoints = [...points]
      newPoints[index] = {
        ...newPoints[index],
        x: value === '' ? NaN : parseFloat(value),
      }
      onChange(newPoints)
    },
    [points, onChange]
  )

  const handleYChange = useCallback(
    (index: number, value: string) => {
      const newPoints = [...points]
      newPoints[index] = {
        ...newPoints[index],
        y: value === '' ? NaN : parseFloat(value),
      }
      onChange(newPoints)
    },
    [points, onChange]
  )

  const addPoint = useCallback(() => {
    onChange([...points, { x: NaN, y: NaN }])
  }, [points, onChange])

  const removePoint = useCallback(
    (index: number) => {
      const newPoints = points.filter((_, i) => i !== index)
      onChange(newPoints.length > 0 ? newPoints : [{ x: NaN, y: NaN }])
    },
    [points, onChange]
  )

  const formatValue = (value: number): string => {
    if (isNaN(value)) return ''
    return value.toString()
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 px-1">
        <div className="w-8 text-center text-sm font-medium text-muted-foreground">
          #
        </div>
        <div className="text-sm font-medium text-muted-foreground">{xValue}</div>
        <div className="text-sm font-medium text-muted-foreground">{yValue}</div>
        <div className="w-9" />
      </div>

      {/* Data rows */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {points.map((point, index) => {
          const rowErrors = errors.get(index)

          return (
            <div
              key={index}
              className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-start"
            >
              <div className="w-8 h-9 flex items-center justify-center text-sm text-muted-foreground">
                {index + 1}
              </div>

              <div className="space-y-1">
                <Input
                  type="number"
                  step="any"
                  value={formatValue(point.x)}
                  onChange={(e) => handleXChange(index, e.target.value)}
                  placeholder={`${xValue} ${index + 1}`}
                  disabled={disabled}
                  className={`font-mono ${
                    rowErrors?.x ? 'border-destructive' : ''
                  }`}
                  aria-label={`${pointLabel} ${index + 1} ${xValue}`}
                />
                {rowErrors?.x && (
                  <p className="text-xs text-destructive">{rowErrors.x}</p>
                )}
              </div>

              <div className="space-y-1">
                <Input
                  type="number"
                  step="any"
                  value={formatValue(point.y)}
                  onChange={(e) => handleYChange(index, e.target.value)}
                  placeholder={`${yValue} ${index + 1}`}
                  disabled={disabled}
                  className={`font-mono ${
                    rowErrors?.y ? 'border-destructive' : ''
                  }`}
                  aria-label={`${pointLabel} ${index + 1} ${yValue}`}
                />
                {rowErrors?.y && (
                  <p className="text-xs text-destructive">{rowErrors.y}</p>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removePoint(index)}
                disabled={disabled || points.length <= 1}
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                aria-label={`Remove point ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>

      {/* Add button */}
      <Button
        variant="outline"
        onClick={addPoint}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {addRow}
      </Button>
    </div>
  )
}
