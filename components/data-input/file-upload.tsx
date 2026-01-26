'use client'

import { useCallback, useState, useRef } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseFile } from '@/lib/math/validators'
import type { DataPoint } from '@/lib/types'

interface FileUploadProps {
  onDataLoaded: (points: DataPoint[]) => void
  disabled?: boolean
  translations: {
    uploadFile: string
    dragDrop: string
    or: string
    browseFiles: string
    supportedFormats: string
    parseError: string
    emptyFile: string
    preview: string
    dataPoints: string
  }
}

export function FileUpload({
  onDataLoaded,
  disabled = false,
  translations,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<DataPoint[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      setError(null)
      setPreview(null)

      const reader = new FileReader()

      reader.onload = (e) => {
        const content = e.target?.result as string

        if (!content || content.trim() === '') {
          setError(translations.emptyFile)
          return
        }

        try {
          const points = parseFile(content, file.name)

          if (points.length === 0) {
            setError(translations.parseError)
            return
          }

          setPreview(points)
        } catch {
          setError(translations.parseError)
        }
      }

      reader.onerror = () => {
        setError(translations.parseError)
      }

      reader.readAsText(file)
    },
    [translations]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled) return

      const file = e.dataTransfer.files[0]
      if (file) {
        processFile(file)
      }
    },
    [disabled, processFile]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragging(true)
      }
    },
    [disabled]
  )

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile]
  )

  const handleConfirm = useCallback(() => {
    if (preview) {
      onDataLoaded(preview)
      setPreview(null)
    }
  }, [preview, onDataLoaded])

  const handleCancel = useCallback(() => {
    setPreview(null)
    setError(null)
  }, [])

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`drop-zone cursor-pointer ${isDragging ? 'drag-over' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,.txt"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{translations.dragDrop}</p>
        <p className="text-sm text-muted-foreground my-2">{translations.or}</p>
        <Button variant="secondary" disabled={disabled} type="button">
          <FileText className="h-4 w-4 mr-2" />
          {translations.browseFiles}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          {translations.supportedFormats}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            {translations.preview}: {preview.length} {translations.dataPoints}
          </p>

          <div className="max-h-[200px] overflow-y-auto bg-card border border-border rounded-lg">
            <table className="data-table text-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>x</th>
                  <th>y</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((point, index) => (
                  <tr key={index}>
                    <td className="text-muted-foreground">{index + 1}</td>
                    <td className="font-mono">{point.x.toFixed(4)}</td>
                    <td className="font-mono">{point.y.toFixed(4)}</td>
                  </tr>
                ))}
                {preview.length > 10 && (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground">
                      ... and {preview.length - 10} more
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConfirm} className="flex-1">
              {translations.uploadFile}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
