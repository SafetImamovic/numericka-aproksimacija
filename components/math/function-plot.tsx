'use client'

import dynamic from 'next/dynamic'
import { useMemo, ComponentType } from 'react'
import type { DataPoint } from '@/lib/types'

// Above this count, data points render as a line instead of individual markers
// SVG markers lag at high counts; lines handle thousands smoothly
const LARGE_DATASET = 150

// Local type definitions for Plotly (must be before dynamic import)
interface PlotData {
  x: number[]
  y: number[]
  mode: string
  type: string
  name: string
  marker?: {
    color: string
    size: number
    line?: {
      color: string
      width: number
    }
  }
  line?: {
    color: string
    width: number
    shape?: string
    dash?: 'dash' | 'dot' | 'dashdot' | 'solid'
  }
  hovertemplate?: string
}

interface PlotLayout {
  title?: {
    text: string
    font: { color: string; size: number }
  }
  paper_bgcolor: string
  plot_bgcolor: string
  font: {
    color: string
  }
  xaxis: {
    title: string
    color: string
    gridcolor: string
    zerolinecolor: string
    range: [number, number]
  }
  yaxis: {
    title: string
    color: string
    gridcolor: string
    zerolinecolor: string
    range: [number, number]
  }
  showlegend: boolean
  legend: {
    x: number
    xanchor: string
    y: number
    bgcolor: string
    bordercolor: string
    borderwidth: number
    font: { color: string }
  }
  margin: { t: number; r: number; b: number; l: number }
  hovermode: string
  dragmode: string
}

interface PlotConfig {
  responsive: boolean
  displayModeBar: boolean
  modeBarButtonsToRemove: string[]
  displaylogo: boolean
  scrollZoom: boolean
  toImageButtonOptions: {
    format: string
    filename: string
    scale: number
  }
}

interface PlotComponentProps {
  data: PlotData[]
  layout: Partial<PlotLayout>
  config: PlotConfig
  style?: React.CSSProperties
  useResizeHandler?: boolean
}

// Dynamically import Plotly with minimal bundle (~3MB vs 115MB)
const Plot = dynamic(
  () => import('plotly.js-basic-dist').then((Plotly) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const createPlotlyComponent = require('react-plotly.js/factory').default
    return createPlotlyComponent(Plotly) as ComponentType<PlotComponentProps>
  }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-muted-foreground">Loading plot...</div>
      </div>
    ),
  }
)

interface FunctionPlotProps {
  dataPoints?: DataPoint[]
  fittedCurve?: DataPoint[]
  originalCurve?: DataPoint[]
  title?: string
  xLabel?: string
  yLabel?: string
  showLegend?: boolean
  className?: string
  height?: number
  dataPointsLabel?: string
  fittedCurveLabel?: string
  originalCurveLabel?: string
}

export function FunctionPlot({
  dataPoints = [],
  fittedCurve = [],
  originalCurve = [],
  title,
  xLabel = 'x',
  yLabel = 'y',
  showLegend = true,
  className = '',
  height = 500,
  dataPointsLabel = 'Data Points',
  fittedCurveLabel = 'Fitted Curve',
  originalCurveLabel = 'Original Function',
}: FunctionPlotProps) {
  const { traces, layout } = useMemo(() => {
    const traces: PlotData[] = []
    const isLarge = dataPoints.length > LARGE_DATASET

    // For large datasets: render as a line with small markers at each point
    // Lines are GPU-friendly in Plotly SVG; thousands of standalone markers are not
    if (dataPoints.length > 0) {
      traces.push({
        x: dataPoints.map((p) => p.x),
        y: dataPoints.map((p) => p.y),
        mode: isLarge ? 'lines+markers' : 'markers',
        type: 'scatter',
        name: dataPointsLabel,
        marker: {
          color: '#8b5cf6', // Purple
          size: isLarge ? 3 : 10,
          line: isLarge ? undefined : {
            color: '#a78bfa',
            width: 2,
          },
        },
        line: isLarge ? {
          color: '#8b5cf6',
          width: 1,
        } : undefined,
        hovertemplate: '(%{x:.4f}, %{y:.4f})<extra></extra>',
      })
    }

    // Add fitted curve
    if (fittedCurve.length > 0) {
      traces.push({
        x: fittedCurve.map((p) => p.x),
        y: fittedCurve.map((p) => p.y),
        mode: 'lines',
        type: 'scatter',
        name: fittedCurveLabel,
        line: {
          color: '#22c55e', // Green
          width: 2,
          shape: 'spline',
        },
        hovertemplate: '(%{x:.4f}, %{y:.4f})<extra></extra>',
      })
    }

    // Add original function curve (dashed)
    if (originalCurve.length > 0) {
      traces.push({
        x: originalCurve.map((p) => p.x),
        y: originalCurve.map((p) => p.y),
        mode: 'lines',
        type: 'scatter',
        name: originalCurveLabel,
        line: {
          color: '#fbbf24', // Amber/Yellow
          width: 2,
          shape: 'spline',
          dash: 'dash',
        },
        hovertemplate: '(%{x:.4f}, %{y:.4f})<extra></extra>',
      })
    }

    // Calculate axis ranges with padding
    const allX = [...dataPoints, ...fittedCurve, ...originalCurve].map((p) => p.x)
    const allY = [...dataPoints, ...fittedCurve, ...originalCurve].map((p) => p.y)

    const xMin = Math.min(...allX)
    const xMax = Math.max(...allX)
    const yMin = Math.min(...allY)
    const yMax = Math.max(...allY)

    const xPadding = (xMax - xMin) * 0.1 || 1
    const yPadding = (yMax - yMin) * 0.1 || 1

    const layout: Partial<PlotLayout> = {
      title: title
        ? {
          text: title,
          font: { color: '#e2e8f0', size: 16 },
        }
        : undefined,
      paper_bgcolor: 'rgba(23, 23, 30, 1)',
      plot_bgcolor: 'rgba(23, 23, 30, 1)',
      font: {
        color: '#94a3b8',
      },
      xaxis: {
        title: xLabel,
        color: '#94a3b8',
        gridcolor: 'rgba(148, 163, 184, 0.1)',
        zerolinecolor: 'rgba(148, 163, 184, 0.3)',
        range: [xMin - xPadding, xMax + xPadding],
      },
      yaxis: {
        title: yLabel,
        color: '#94a3b8',
        gridcolor: 'rgba(148, 163, 184, 0.1)',
        zerolinecolor: 'rgba(148, 163, 184, 0.3)',
        range: [yMin - yPadding, yMax + yPadding],
      },
      showlegend: showLegend && traces.length > 1,
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1,
        bgcolor: 'rgba(30, 30, 40, 0.8)',
        bordercolor: 'rgba(148, 163, 184, 0.2)',
        borderwidth: 1,
        font: { color: '#e2e8f0' },
      },
      margin: { t: title ? 50 : 30, r: 30, b: 50, l: 60 },
      hovermode: 'closest',
      dragmode: 'pan',
    }

    return { traces, layout }
  }, [dataPoints, fittedCurve, originalCurve, title, xLabel, yLabel, showLegend, dataPointsLabel, fittedCurveLabel, originalCurveLabel])

  const config: PlotConfig = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: [
      'select2d',
      'lasso2d',
      'autoScale2d',
      'toggleSpikelines',
    ],
    displaylogo: false,
    scrollZoom: true,
    toImageButtonOptions: {
      format: 'png',
      filename: 'plot',
      scale: 2,
    },
  }
  const hasData = dataPoints.length > 0 || fittedCurve.length > 0 || originalCurve.length > 0

  if (!hasData) {
    return (
      <div
        className={`w-full flex items-center justify-center bg-card rounded-lg border border-border ${className}`}
        style={{ height }}
      >
        <div className="text-muted-foreground">No data to display</div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: '100%', height }}
        useResizeHandler
      />
    </div>
  )
}
