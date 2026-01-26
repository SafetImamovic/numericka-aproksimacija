import type { MathfieldElement } from 'mathlive'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<MathfieldElement> & {
          value?: string
          'virtual-keyboard-mode'?: 'auto' | 'manual' | 'off'
          'math-mode-space'?: string
        },
        MathfieldElement
      >
    }
  }
}

export {}
