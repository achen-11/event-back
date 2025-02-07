'use client'

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function TagInput({ value, onChange }: TagInputProps) {
  return (
    <FormItem>
      <FormLabel>标签</FormLabel>
      <FormControl>
        <div className="flex flex-wrap gap-1">
          {value.map((tag, index) => (
            <Badge key={index} variant="secondary" className="gap-1" >
              #{tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newTags = [...value]
                  newTags.splice(index, 1)
                  onChange(newTags)
                }}
              />
            </Badge>
          ))}
          <Input
            placeholder="输入标签后按回车"
            className="w-[200px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const input = e.currentTarget
                const value = input.value.trim()
                if (value && !value.includes(value)) {
                  onChange([...value, value])
                  input.value = ''
                }
              }
            }}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
} 