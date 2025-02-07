'use client'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EventDialog } from "@/components/events/EventDialog"
import { useState } from "react"
import type { Category } from "@/types"

export function AddEventButton({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button className="rounded-full p-0 w-10 h-10 md:w-12 md:h-12" onClick={() => setOpen(true)}>
        <Plus />
      </Button>
      <EventDialog open={open} onOpenChange={setOpen} categories={categories} />
    </>
  )
}
