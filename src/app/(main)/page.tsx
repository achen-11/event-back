'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/lib/http'
import EventsView from "@/components/events/EventsView"

export default function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  })

  console.log('categories', categories)
  
  return (
    <div className="md:pr-16">
      <EventsView categories={categories}></EventsView>
    </div>
  )
}