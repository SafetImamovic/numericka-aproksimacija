'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LatexDisplay } from '@/components/math/latex-display'

interface StepDisplayProps {
  steps: string[]
  title: string
  defaultExpanded?: boolean
}

export function StepDisplay({
  steps,
  title,
  defaultExpanded = false,
}: StepDisplayProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (steps.length === 0) return null

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 h-auto rounded-none"
      >
        <span className="font-medium">{title}</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {expanded && (
        <div className="px-4 py-3 border-t border-border bg-card/50">
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
