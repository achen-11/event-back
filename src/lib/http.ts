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


export async function fetchCategories() {
  try {
    const { data } = await api.get('/api/categories')
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories')
    }
    throw error
  }
}

export default api