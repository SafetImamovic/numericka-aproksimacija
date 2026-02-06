'use client'

import { useRef } from 'react'
import { Database } from 'lucide-react'
import type { ExampleDataset } from '@/lib/data/example-datasets'
import type { DataPoint } from '@/lib/types'

interface DatasetSelectorProps {
  datasets: ExampleDataset[]
  onSelect: (points: DataPoint[]) => void
  disabled?: boolean
  translations: {
    exampleDatasets: string
    selectDataset: string
    datasetNames: Record<string, string>
  }
}

export function DatasetSelector({
  datasets,
  onSelect,
  disabled = false,
  translations,
}: DatasetSelectorProps) {
  const selectRef = useRef<HTMLSelectElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const datasetId = e.target.value
    if (!datasetId) return

    const dataset = datasets.find((d) => d.id === datasetId)
    if (dataset) {
      onSelect(dataset.points.map((p) => ({ ...p })))
    }

    // Reset so the same dataset can be re-picked
    if (selectRef.current) {
      selectRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Database className="h-4 w-4 text-muted-foreground shrink-0" />
      <select
        ref={selectRef}
        onChange={handleChange}
        disabled={disabled}
        defaultValue=""
        className="border-input dark:bg-input/30 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="" disabled>
          {translations.selectDataset}
        </option>
        {datasets.map((dataset) => (
          <option key={dataset.id} value={dataset.id}>
            {translations.datasetNames[dataset.id] ?? dataset.id} ({dataset.points.length} pts)
          </option>
        ))}
      </select>
    </div>
  )
}
