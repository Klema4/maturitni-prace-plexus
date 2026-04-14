'use client'

import { useId } from 'react'

/**
 * LineChart komponenta
 * Renderuje responsivní SVG line chart pro zobrazení časové řady dat.
 * Čistý React + TypeScript bez externích knihoven.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {Array<{date: string, value: number}>} props.data - Pole datových bodů pro graf.
 * @param {number} props.height - Výška grafu v pixelech.
 * @param {string} props.strokeColor - Barva čáry grafu (CSS barva).
 * @return {JSX.Element} LineChart komponenta.
 */

export interface LineChartDataPoint {
  date: string
  value: number
}

export interface LineChartProps {
  data: LineChartDataPoint[]
  height?: number
  strokeColor?: string
}

export function LineChart({
  data,
  height = 200,
  strokeColor = 'currentColor',
}: LineChartProps) {
  const gradientId = 'lc-' + useId().replace(/[^a-zA-Z0-9-_]/g, '')

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-zinc-500 text-sm tracking-tight"
        style={{ height }}
      >
        Žádná data k zobrazení
      </div>
    )
  }

  const padding = { top: 12, right: 12, bottom: 12, left: 12 }
  const values = data.map((d) => d.value)
  const maxVal = Math.max(...values)
  const minVal = Math.min(...values)
  const range = maxVal - minVal || 1
  const chartHeight = height - padding.top - padding.bottom
  const chartWidth = 100 - padding.left - padding.right
  const pointCount = data.length
  const stepX = pointCount > 1 ? chartWidth / (pointCount - 1) : 0

  const points = data.map((d, i) => {
    const x = padding.left + i * stepX
    const normalized = (d.value - minVal) / range
    const y = padding.top + (1 - normalized) * chartHeight
    return { x, y }
  })

  const linePathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')
  const areaPathD =
    points.length > 0
      ? `${linePathD} L ${points[points.length - 1]!.x} ${height} L ${points[0]!.x} ${height} Z`
      : ''

  const svgViewBox = `0 0 100 ${height}`

  return (
    <div
      className="w-full cursor-default"
      style={{ height }}
      role="img"
      aria-label="Časová řada dat"
    >
      <svg
        viewBox={svgViewBox}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {areaPathD && (
          <path
            d={areaPathD}
            fill={`url(#${gradientId})`}
          />
        )}
        <path
          d={linePathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
