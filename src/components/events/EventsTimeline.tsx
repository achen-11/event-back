import { EventQuery, Event } from "@/types";

export function EventsTimeline({ searchQuery }: { events: Event[], searchQuery: EventQuery }) {
  return (
    <div>
      <div>{searchQuery.category}</div>
      <div>{searchQuery.keyword}</div>
    </div>
  )
}