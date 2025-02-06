import { headers } from 'next/headers'
import EventsView from "@/components/events/EventsView"

const fetchCategories = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const headersList = headers()
  const cookie = (await headersList).get('cookie')

  const res = await fetch(baseUrl + '/api/categories', {
    headers: { Cookie: cookie || '', }, credentials: 'include',
  })
  
  if (!res.ok) {
    console.error('Failed to fetch categories:', res.status, res.statusText)
    return []
  }

  return res.json()
}

export default async function Home() {
  const categories = await fetchCategories()
  console.log('categories', categories)
  
  return (
    <div>
      <EventsView categories={categories}></EventsView>
    </div>
  )
}