'use client'

import { useState } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { formatDate } from "@/lib/utils"
import type { EventQuery, Category } from "@/types"
import { FilterFieldsBar } from "@/components/events/FilterFieldsBar"
import { EventsTimeline } from "@/components/events/EventsTimeline"



export default function EventsView({ categories }: { categories: Category[] }) {
  
  const [searchQuery, setSearchQuery] = useState<EventQuery>({
    keyword: '',
    category: 'all',
  })
  const setSelectedCategory = (category: string) => {
    setSearchQuery({ ...searchQuery, category })
  }
  const setKeyword = (keyword: string) => {
    setSearchQuery({ ...searchQuery, keyword })
  }

  return (
    <div className="p-4">
      {/* search */}
      <section className="search-bar" role="searchbar">
        <FilterFieldsBar
          categories={categories}
          searchQuery={searchQuery} setSelectedCategory={setSelectedCategory}
          setKeyword={setKeyword}
        >

        </FilterFieldsBar>
      </section>
      {/* event list */}
      <EventsTimeline searchQuery={searchQuery} />
    </div>
  )
}
