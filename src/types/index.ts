export interface EventQuery {
  keyword?: string
  category?: string
}

export interface Event {
  id: string
  title: string
  description: string
  category: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color?: string
  icon?: string
}