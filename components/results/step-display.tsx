'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LatexDisplay } from '@/components/math/latex-display'

interface StepDisplayProps {
  steps: string[]
  title: string
  defaultExpanded?: boolean
  maxHeight?: number
}

export function StepDisplay({
  steps,
  title,
  defaultExpanded = false,
  maxHeight,
}: StepDisplayProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (steps.length === 0) return null

  const containerStyle = maxHeight ? { maxHeight, height: maxHeight } : {}
  const contentStyle = maxHeight ? { maxHeight: maxHeight - 52, overflowY: 'auto' as const } : {}

  return (
    <div
      className="border border-border rounded-lg overflow-hidden flex flex-col"
      style={containerStyle}
    >
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 h-auto rounded-none flex-shrink-0"
      >
        <span className="font-medium">{title}</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {expanded && (
        <div
          className="px-4 py-3 border-t border-border bg-card/50 flex-1"
          style={contentStyle}
        >
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="math-step">
                <LatexDisplay latex={step} displayMode />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
