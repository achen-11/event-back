'use client'

import { useState } from "react"
import type { EventQuery, Category } from "@/types"
import { FilterFieldsBar } from "@/components/events/FilterFieldsBar"
import { EventsTimeline } from "@/components/events/EventsTimeline"
import { AddEventButton } from "@/components/FloatingBtns/AddEventBtn"



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
    <div className="p-4 relative">
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
      <section className="mt-4">
        <EventsTimeline searchQuery={searchQuery} />
      </section>
      <div className="fixed bottom-[76px] md:bottom-10 right-4">
        <AddEventButton categories={categories} />
      </div>
    </div>
  )
}

