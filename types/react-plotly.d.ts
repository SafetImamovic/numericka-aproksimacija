declare module 'react-plotly.js' {
  import { Component } from 'react'
  import Plotly from 'plotly.js'

  interface PlotParams {
    data: Plotly.Data[]
    layout?: Partial<Plotly.Layout>
    config?: Partial<Plotly.Config>
    frames?: Plotly.Frame[]
    style?: React.CSSProperties
    className?: string
    useResizeHandler?: boolean
    debug?: boolean
    onInitialized?: (figure: Readonly<Plotly.Figure>, graphDiv: HTMLElement) => void
    onUpdate?: (figure: Readonly<Plotly.Figure>, graphDiv: HTMLElement) => void
    onPurge?: (figure: Readonly<Plotly.Figure>, graphDiv: HTMLElement) => void
    onError?: (err: Error) => void
    divId?: string
    onClick?: (event: Plotly.PlotMouseEvent) => void
    onHover?: (event: Plotly.PlotHoverEvent) => void
    onUnhover?: (event: Plotly.PlotMouseEvent) => void
    onSelected?: (event: Plotly.PlotSelectionEvent) => void
  }

  export default class Plot extends Component<PlotParams> {}
}

declare module 'plotly.js' {
  export interface Data {
    type?: string
    x?: (number | string)[]
    y?: (number | string)[]
    z?: number[][]
    mode?: string
    name?: string
    marker?: {
      color?: string | string[]
      size?: number | number[]
      line?: {
        color?: string
        width?: number
      }
      opacity?: number
    }
    line?: {
      color?: string
      width?: number
      dash?: string
      shape?: string
    }
    fill?: string
    fillcolor?: string
    hovertemplate?: string
    hoverlabel?: {
      bgcolor?: string
      bordercolor?: string
      font?: {
        color?: string
        size?: number
      }
    }
    text?: string[]
    textposition?: string
    opacity?: number
  }

  export interface Layout {
    title?: string | { text?: string; font?: { color?: string; size?: number } }
    paper_bgcolor?: string
    plot_bgcolor?: string
    font?: {
      color?: string
      family?: string
      size?: number
    }
    xaxis?: Partial<LayoutAxis>
    yaxis?: Partial<LayoutAxis>
    showlegend?: boolean
    legend?: {
      x?: number
      y?: number
      xanchor?: string
      yanchor?: string
      bgcolor?: string
      bordercolor?: string
      borderwidth?: number
      font?: { color?: string; size?: number }
    }
    margin?: {
      l?: number
      r?: number
      t?: number
      b?: number
      pad?: number
    }
    hovermode?: string | false
    dragmode?: string | false
    width?: number
    height?: number
    autosize?: boolean
  }

  export interface LayoutAxis {
    title?: string | { text?: string; font?: { color?: string } }
    titlefont?: { color?: string; size?: number }
    tickfont?: { color?: string; size?: number }
    color?: string
    gridcolor?: string
    zerolinecolor?: string
    linecolor?: string
    range?: [number, number]
    autorange?: boolean | 'reversed'
    type?: 'linear' | 'log' | 'date' | 'category' | 'multicategory'
    showgrid?: boolean
    showline?: boolean
    zeroline?: boolean
    dtick?: number | string
    tickmode?: string
    nticks?: number
    tickvals?: (number | string)[]
    ticktext?: string[]
    tickangle?: number
    tickformat?: string
  }

  export interface Config {
    responsive?: boolean
    displayModeBar?: boolean | 'hover'
    modeBarButtonsToRemove?: string[]
    modeBarButtonsToAdd?: string[]
    displaylogo?: boolean
    toImageButtonOptions?: {
      format?: string
      filename?: string
      width?: number
      height?: number
      scale?: number
    }
    scrollZoom?: boolean
    editable?: boolean
    staticPlot?: boolean
  }

  export interface Frame {
    name?: string
    data?: Data[]
    layout?: Partial<Layout>
    group?: string
  }

  export interface Figure {
    data: Data[]
    layout: Layout
    frames?: Frame[]
  }

  export interface PlotMouseEvent {
    points: {
      x: number
      y: number
      pointNumber: number
      curveNumber: number
      data: Data
    }[]
    event: MouseEvent
  }

  export interface PlotHoverEvent extends PlotMouseEvent {}

  export interface PlotSelectionEvent {
    points: {
      x: number
      y: number
      pointNumber: number
      curveNumber: number
    }[]
    range?: {
      x: [number, number]
      y: [number, number]
    }
  }
}
