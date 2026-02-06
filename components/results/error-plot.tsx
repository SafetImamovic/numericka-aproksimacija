'use client'

import dynamic from 'next/dynamic'
import { useMemo, ComponentType } from 'react'

interface PlotData {
  x: number[]
  y: number[]
  mode: string
  type: string
  name: string
  marker?: {
    color: string
    size: number
  }
  line?: {
    color: string
    width: number
  }
  yaxis?: string
  hovertemplate?: string
}

interface PlotLayout {
  paper_bgcolor: string
  plot_bgcolor: string
  font: { color: string }
  xaxis: {
    title: string
    color: string
    gridcolor: string
    zerolinecolor: string
  }
  yaxis: {
    title: string
    color: string
    gridcolor: string
    zerolinecolor: string
    side?: string
  }
  yaxis2?: {
    title: string
    color: string
    gridcolor: string
    overlaying: string
    side: string
    showgrid: boolean
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
  barmode?: string
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

const Plot = dynamic(
  () => import('plotly.js-basic-dist').then((Plotly) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const createPlotlyComponent = require('react-plotly.js/factory').default
    return createPlotlyComponent(Plotly) as ComponentType<PlotComponentProps>
  }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-muted-foreground">Loading plot...</div>
      </div>
    ),
  }
)

interface ErrorPlotProps {
  points: { x: number; y: number }[]
  errors: { absolute: number; relative: number }[]
  height?: number
  translations: {
    absoluteError: string
    relativeError: string
  }
}

export function ErrorPlot({ points, errors, height = 300, translations }: ErrorPlotProps) {
  const { traces, layout } = useMemo(() => {
    const xValues = points.map(p => p.x)

    const traces: PlotData[] = [
      {
        x: xValues,
        y: errors.map(e => e.absolute),
        mode: 'lines+markers',
        type: 'scatter',
        name: translations.absoluteError,
        marker: { color: '#3b82f6', size: 8 },
        line: { color: '#3b82f6', width: 2 },
        hovertemplate: 'x=%{x}<br>Abs=%{y:.6f}<extra></extra>',
      },
      {
        x: xValues,
        y: errors.map(e => e.relative * 100),
        mode: 'lines+markers',
        type: 'scatter',
        name: `${translations.relativeError} (%)`,
        marker: { color: '#f97316', size: 8 },
        line: { color: '#f97316', width: 2 },
        yaxis: 'y2',
        hovertemplate: 'x=%{x}<br>Rel=%{y:.4f}%<extra></extra>',
      },
    ]

    const layout: Partial<PlotLayout> = {
      paper_bgcolor: 'rgba(23, 23, 30, 1)',
      plot_bgcolor: 'rgba(23, 23, 30, 1)',
      font: { color: '#94a3b8' },
      xaxis: {
        title: 'x',
        color: '#94a3b8',
        gridcolor: 'rgba(148, 163, 184, 0.1)',
        zerolinecolor: 'rgba(148, 163, 184, 0.3)',
      },
      yaxis: {
        title: translations.absoluteError,
        color: '#3b82f6',
        gridcolor: 'rgba(148, 163, 184, 0.1)',
        zerolinecolor: 'rgba(148, 163, 184, 0.3)',
      },
      yaxis2: {
        title: `${translations.relativeError} (%)`,
        color: '#f97316',
        gridcolor: 'rgba(148, 163, 184, 0.05)',
        overlaying: 'y',
        side: 'right',
        showgrid: false,
      },
      showlegend: true,
      legend: {
        x: 0.5,
        xanchor: 'center',
        y: 1.1,
        bgcolor: 'rgba(30, 30, 40, 0.8)',
        bordercolor: 'rgba(148, 163, 184, 0.2)',
        borderwidth: 1,
        font: { color: '#e2e8f0' },
      },
      margin: { t: 40, r: 60, b: 50, l: 60 },
      hovermode: 'x unified',
      dragmode: 'pan',
    }

    return { traces, layout }
  }, [points, errors, translations])

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
      filename: 'error-plot',
      scale: 2,
    },
  }

  if (errors.length === 0) return null

  return (
    <div className="w-full">
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
