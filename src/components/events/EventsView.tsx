'use client'

import { useState, useEffect } from "react"
import type { EventQuery, Category } from "@/types"
import { FilterFieldsBar } from "@/components/events/FilterFieldsBar"
import { EventsTimeline } from "@/components/events/EventsTimeline"
import { AddEventButton } from "@/components/FloatingBtns/AddEventBtn"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchEvents } from "@/lib/http"

export default function EventsView({ categories }: { categories: Category[] }) {
  const [searchQuery, setSearchQuery] = useState<EventQuery>({
    keyword: '',
    category: 'all',
  })

  const { 
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['events', searchQuery],
    queryFn: ({ pageParam = 1 }) => fetchEvents({
      page: pageParam,
      pageSize: 10,
      category: searchQuery.category === 'all' ? undefined : searchQuery.category,
      keyword: searchQuery.keyword || undefined,
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    initialPageParam: 1
  })

  const allEvents = data?.pages.flatMap(page => page.events) || []

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const setSelectedCategory = (category: string) => {
    setSearchQuery({ ...searchQuery, category })
  }

  const setKeyword = (keyword: string) => {
    setSearchQuery({ ...searchQuery, keyword })
  }

  return (
    <div className="p-4 relative">
      {/* search */}
      <section className="search-bar" role="searchbar">
        <FilterFieldsBar
          categories={categories}
          searchQuery={searchQuery}
          setSelectedCategory={setSelectedCategory}
          setKeyword={setKeyword}
        />
      </section>
      {/* event list */}
      <section className="mt-4">
        <EventsTimeline 
          events={allEvents}
          isLoading={isLoading || isFetchingNextPage}
        />
      </section>
      <div className="fixed bottom-[76px] md:bottom-10 right-4">
        <AddEventButton categories={categories} searchQuery={searchQuery}/>
      </div>
    </div>
  )
}

