export const DEFAULT_PAGE_SIZE = 10

export const TIME_RANGES = {
  DAY: '1',
  WEEK: '7',
  MONTH: '30',
  YEAR: '365'
} as const

export const INITIAL_PAGINATION = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 0
}

export const PRESET_COLORS = [
  {
    name: "天空蓝",
    value: "#0EA5E9", // Sky 500
  },
  {
    name: "薰衣草",
    value: "#8B5CF6", // Violet 500
  },
  {
    name: "珊瑚粉",
    value: "#F472B6", // Pink 400
  },
  {
    name: "薄荷绿",
    value: "#10B981", // Emerald 500
  },
  {
    name: "琥珀橙",
    value: "#F59E0B", // Amber 500
  },
  {
    name: "石榴红",
    value: "#EF4444", // Red 500
  },
  {
    name: "海蓝",
    value: "#3B82F6", // Blue 500
  },
  {
    name: "青柠",
    value: "#84CC16", // Lime 500
  }
] as const 