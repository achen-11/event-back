// import { type Event, type Category, type Timeline } from '@/types'
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXTAUTH_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  xsrfCookieName: 'next-auth.csrf-token',
  xsrfHeaderName: 'next-auth.csrf-token'
})

// 添加请求拦截器用于调试
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)

      console.log('Request cookies:', cookies)
    }

    console.log('Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface CreateEventInput {
  title: string
  content?: string
  timestamp: Date
  isImportant: boolean
  mainImage?: string
  images: Array<{ id: string; url: string; thumbnail?: string }>
  categories: string[]
  tags: string[]
}

export async function createEvent(data: CreateEventInput) {
  try {
    const response = await api.post('/api/events', data)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create event')
    }
    throw error
  }
}

export async function updateEvent(id: string, data: Partial<CreateEventInput>) {
  try {
    const response = await api.put(`/api/events/${id}`, data)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update event')
    }
    throw error
  }
}

export async function deleteEvent(id: string) {
  try {
    const response = await api.delete(`/api/events/${id}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete event')
    }
    throw error
  }
}

export interface Category {
  id: string
  name: string
  color: string
}

export async function fetchCategories() {
  try {
    const { data } = await api.get<Category[]>('/api/categories')
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || '加载分类失败')
    }
    throw error
  }
}

export async function deleteCategory(id: string) {
  try {
    const response = await api.delete(`/api/categories/${id}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || '删除分类失败')
    }
    throw error
  }
}

export interface CreateCategoryInput {
  name: string
  color: string
}

export async function createCategory(data: CreateCategoryInput) {
  try {
    const response = await api.post('/api/categories', data)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || '创建分类失败')
    }
    throw error
  }
}

export async function updateCategory(id: string, data: CreateCategoryInput) {
  try {
    const response = await api.put(`/api/categories/${id}`, data)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || '更新分类失败')
    }
    throw error
  }
}

// 添加获取事件的接口
export interface FetchEventsParams {
  page: number
  pageSize: number
  category?: string
  keyword?: string
}

export async function fetchEvents(params: FetchEventsParams) {
  try {
    const { data } = await api.get('/api/events', { params })
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch events')
    }
    throw error
  }
}

interface StatisticsParams {
  timeRange?: string
  category?: string
}

export async function fetchStatistics(params?: StatisticsParams) {
  try {
    const { data } = await api.get('/api/statistics', {
      params,
    })
    return data
  } catch (error) {
    console.error('Statistics fetch error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics')
    }
    throw error
  }
}

export interface UpdateProfileInput {
  name: string
  email: string
  image?: string
}

export async function updateProfile(data: UpdateProfileInput) {
  try {
    const response = await api.put('/api/account', data)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || '更新个人信息失败')
    }
    throw error
  }
}

export default api