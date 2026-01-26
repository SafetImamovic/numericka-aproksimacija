'use client'

import { useState, useCallback } from 'react'
import { FileText, Upload, FunctionSquare } from 'lucide-react'
import { ManualInput } from './manual-input'
import { FileUpload } from './file-upload'
import { FunctionInput } from './function-input'
import type { DataPoint, InputMode } from '@/lib/types'

interface InputTabsProps {
  points: DataPoint[]
  onPointsChange: (points: DataPoint[], originalCurve?: DataPoint[]) => void
  errors?: Map<number, { x?: string; y?: string }>
  disabled?: boolean
  translations: {
    title: string
    manualTab: string
    fileTab: string
    functionTab: string
    xValue: string
    yValue: string
    addRow: string
    clearAll: string
    point: string
    uploadFile: string
    dragDrop: string
    or: string
    browseFiles: string
    supportedFormats: string
    parseError: string
    emptyFile: string
    functionExpression: string
    functionPlaceholder: string
    domainMin: string
    domainMax: string
    samplePoints: string
    generatePoints: string
    invalidExpression: string
    domainError: string
    preview: string
    dataPoints: string
  }
}

export function InputTabs({
  points,
  onPointsChange,
  errors,
  disabled = false,
  translations,
}: InputTabsProps) {
  const [activeTab, setActiveTab] = useState<InputMode>('manual')

  const tabs = [
    {
      id: 'manual' as const,
      label: translations.manualTab,
      icon: FileText,
    },
    {
      id: 'file' as const,
      label: translations.fileTab,
      icon: Upload,
    },
    {
      id: 'function' as const,
      label: translations.functionTab,
      icon: FunctionSquare,
    },
  ]

  const handleDataLoaded = useCallback(
    (newPoints: DataPoint[], originalCurve?: DataPoint[]) => {
      onPointsChange(newPoints, originalCurve)
      setActiveTab('manual') // Switch to manual view to show/edit loaded data
    },
    [onPointsChange]
  )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{translations.title}</h3>

      {/* Tab buttons */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={disabled}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors
                ${isActive
                  ? 'text-primary border-b-2 border-primary -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="pt-2">
        {activeTab === 'manual' && (
          <ManualInput
            points={points}
            onChange={onPointsChange}
            errors={errors}
            disabled={disabled}
            translations={{
              xValue: translations.xValue,
              yValue: translations.yValue,
              addRow: translations.addRow,
              clearAll: translations.clearAll,
              point: translations.point,
            }}
          />
        )}

        {activeTab === 'file' && (
          <FileUpload
            onDataLoaded={handleDataLoaded}
            disabled={disabled}
            translations={{
              uploadFile: translations.uploadFile,
              dragDrop: translations.dragDrop,
              or: translations.or,
              browseFiles: translations.browseFiles,
              supportedFormats: translations.supportedFormats,
              parseError: translations.parseError,
              emptyFile: translations.emptyFile,
              preview: translations.preview,
              dataPoints: translations.dataPoints,
            }}
          />
        )}

        {activeTab === 'function' && (
          <FunctionInput
            onPointsGenerated={handleDataLoaded}
            disabled={disabled}
            translations={{
              functionExpression: translations.functionExpression,
              functionPlaceholder: translations.functionPlaceholder,
              domainMin: translations.domainMin,
              domainMax: translations.domainMax,
              samplePoints: translations.samplePoints,
              generatePoints: translations.generatePoints,
              invalidExpression: translations.invalidExpression,
              domainError: translations.domainError,
              preview: translations.preview,
              dataPoints: translations.dataPoints,
            }}
          />
        )}
      </div>
    </div>
  )
}
