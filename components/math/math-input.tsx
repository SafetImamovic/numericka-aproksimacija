'use client'

import { useEffect, useRef, useCallback, createElement } from 'react'
import type { MathfieldElement } from 'mathlive'

interface MathInputProps {
  value?: string
  onChange?: (latex: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MathInput({
  value = '',
  onChange,
  placeholder,
  className = '',
  disabled = false,
}: MathInputProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mathFieldRef = useRef<MathfieldElement | null>(null)
  const isInitializedRef = useRef(false)

  // Initialize MathLive
  useEffect(() => {
    const initMathField = async () => {
      if (isInitializedRef.current || !containerRef.current) return

      try {
        // Dynamically import MathLive
        await import('mathlive')

        // Create the math-field element
        const mathField = document.createElement('math-field') as MathfieldElement
        mathField.value = value
        mathField.setAttribute('virtual-keyboard-mode', 'auto')
        mathField.setAttribute('math-mode-space', '\\;')
        mathField.className = `${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`
        mathField.setAttribute('aria-label', placeholder || 'Mathematical expression input')
        mathField.style.cssText = '--placeholder-color: oklch(0.5 0.03 260)'

        // Clear container and append
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(mathField)
        mathFieldRef.current = mathField

        // Add event listener
        mathField.addEventListener('input', (evt: Event) => {
          const target = evt.target as MathfieldElement
          onChange?.(target.value)
        })

        isInitializedRef.current = true
      } catch (error) {
        console.error('Failed to load MathLive:', error)
      }
    }

    initMathField()
  }, [className, disabled, placeholder, onChange, value])

  // Update value when prop changes
  useEffect(() => {
    if (mathFieldRef.current && mathFieldRef.current.value !== value) {
      mathFieldRef.current.value = value
    }
  }, [value])

  // Update disabled state
  useEffect(() => {
    if (mathFieldRef.current) {
      mathFieldRef.current.className = `${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`
    }
  }, [className, disabled])

  return <div ref={containerRef} className="w-full min-h-[3rem]" />
}
