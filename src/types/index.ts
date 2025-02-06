export interface EventQuery {
  keyword?: string
  category?: string
}

export interface Image {
  id: string
  url: string
}

export interface Event {
  id: string
  title: string
  content?: string
  timestamp: Date
  isImportant: boolean
  mainImage?: string
  tags: string[]
  categories: Category[]
  images: Image[]
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color?: string
  icon?: string
}