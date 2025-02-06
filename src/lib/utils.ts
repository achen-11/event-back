import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 日期格式化
export function formatDate(date: Date | string, format = "YYYY-MM-DD HH:mm") {
  return dayjs(date).format(format)
}