declare module 'react-calendar-heatmap' {
  import { ComponentType, ReactElement, JSXElementConstructor, SVGProps } from 'react'

  interface CalendarHeatmapValue {
    date: string
    count: number
    contentLength?: number
  }

  interface DayElementAttributes {
    onClick?: (event: React.MouseEvent<SVGGElement>) => void
    onMouseOver?: (event: React.MouseEvent<SVGGElement>) => void
    onMouseLeave?: () => void
    onTouchStart?: (event: React.TouchEvent<SVGGElement>) => void
    onTouchEnd?: () => void
  }

  interface CalendarHeatmapProps {
    values: CalendarHeatmapValue[]
    startDate: Date
    endDate: Date
    classForValue?: (value: CalendarHeatmapValue | null) => string
    titleForValue?: (value: CalendarHeatmapValue | null) => string
    transformDayElement?: (
      element: ReactElement<SVGProps<SVGGElement> & DayElementAttributes, string | JSXElementConstructor<SVGGElement>>,
      value: CalendarHeatmapValue | null
    ) => ReactElement<DayElementAttributes, string | JSXElementConstructor<SVGGElement>>
    showWeekdayLabels?: boolean
    weekdayLabels?: string[]
    gutterSize?: number
  }

  const CalendarHeatmap: ComponentType<CalendarHeatmapProps>
  export default CalendarHeatmap
} 