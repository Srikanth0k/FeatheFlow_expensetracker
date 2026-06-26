import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Delete } from 'lucide-react'
import { Card } from '../ui/Card'
import { cn } from '../../utils/cn'

type CalcButton = {
  label: string
  colSpan?: number
  variant?: 'clear' | 'operator' | 'default'
  icon?: 'delete'
}

const BUTTON_ROWS: CalcButton[][] = [
  [
    { label: 'C', variant: 'clear' },
    { label: '⌫', icon: 'delete' },
    { label: '÷', variant: 'operator' },
    { label: '×', variant: 'operator' },
  ],
  [
    { label: '7' },
    { label: '8' },
    { label: '9' },
    { label: '-', variant: 'operator' },
  ],
  [
    { label: '4' },
    { label: '5' },
    { label: '6' },
    { label: '−', variant: 'operator' },
  ],
  [
    { label: '1' },
    { label: '2' },
    { label: '3' },
    { label: '+', variant: 'operator' },
  ],
  [
    { label: '0', colSpan: 2 },
    { label: '.' },
    { label: '=', variant: 'operator' },
  ],
]

export function CalculatorWidget() {
  const [display, setDisplay] = useState('0')
  const [expanded, setExpanded] = useState(false)

  const handlePress = (val: string) => {
    if (val === 'C') {
      setDisplay('0')
      return
    }
    if (val === '=') {
      try {
        const expr = display
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-')
        const result = Function('"use strict"; return (' + expr + ')')()
        setDisplay(String(Math.round(result * 100) / 100))
      } catch {
        setDisplay('Error')
      }
      return
    }
    if (val === '⌫') {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0')
      return
    }
    setDisplay(display === '0' || display === 'Error' ? val : display + val)
  }

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} className="w-full">
        <Card padding="sm" hover className="flex items-center gap-2 cursor-pointer">
          <Calculator className="h-4 w-4 text-[var(--color-primary)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Calculator</span>
        </Card>
      </button>
    )
  }

  return (
    <Card padding="sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[var(--color-text-muted)]">Calculator</span>
        <button onClick={() => setExpanded(false)} className="text-xs text-[var(--color-primary)]">
          Minimize
        </button>
      </div>
      <div className="bg-[var(--color-background)]/50 rounded-lg p-2 mb-2 text-right font-mono text-lg truncate min-h-[2.5rem] flex items-center justify-end">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {BUTTON_ROWS.flat().map((btn, index) => (
          <motion.button
            key={`${btn.label}-${index}`}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePress(btn.label)}
            className={cn(
              'h-9 rounded-lg text-xs font-medium transition-colors flex items-center justify-center',
              btn.colSpan === 2 && 'col-span-2',
              btn.variant === 'clear' && 'bg-red-500/10 text-red-400',
              btn.variant === 'operator' && 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]',
              !btn.variant && 'bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-active)]'
            )}
          >
            {btn.icon === 'delete' ? <Delete className="h-3 w-3" /> : btn.label}
          </motion.button>
        ))}
      </div>
    </Card>
  )
}
