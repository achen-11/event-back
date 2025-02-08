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
            className="w-[200px] text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                console.log('enter tag');
                
                e.preventDefault()
                const input = e.currentTarget
                const newTag = input.value.trim()
                
                if (newTag && !value.includes(newTag)) {
                  onChange([...value, newTag])
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