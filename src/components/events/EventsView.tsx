'use client'

import { useState, useEffect } from "react"
import type { EventQuery, Category, Event as EventType } from "@/types"
import { FilterFieldsBar } from "@/components/events/FilterFieldsBar"
import { EventsTimeline } from "@/components/events/EventsTimeline"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchEvents } from "@/lib/http"
import { EventDialog } from "@/components/events/EventDialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function EventsView({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [activeEvent, setActiveEvent] = useState<EventType | undefined>()
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

  const openEventDialog = (event?: EventType) => {
    setActiveEvent(event)
    setOpen(true)
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
          openEventDialog={openEventDialog}
        />
      </section>
      <div className="fixed bottom-[76px] md:bottom-10 right-4">
        <Button className="rounded-full p-0 w-10 h-10 md:w-12 md:h-12" onClick={() => openEventDialog()}>
          <Plus />
        </Button>
        <EventDialog 
          event={activeEvent} 
          open={open} 
          onOpenChange={setOpen} 
          categories={categories} 
          searchQuery={searchQuery} 
        />
      </div>
    </div>
  )
}

