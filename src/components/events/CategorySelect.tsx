'use client'

import { Category } from "@/types"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandSeparator } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createCategory } from "@/lib/http"

interface CategorySelectProps {
  categories: Category[]
  value: string[]
  onChange: (value: string[]) => void
}

export function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const queryClient = useQueryClient()

  const { mutate: submitCategory } = useMutation({
    mutationFn: (name: string) => createCategory({
      name,
      color: "#000000"
    }),
    onSuccess: (newCategory) => {
      queryClient.setQueryData<Category[]>(['categories'], (old = []) => [...old, newCategory])
      setIsCreating(false)
      setNewCategoryName('')
      // 自动选中新创建的分类
      onChange([...value, newCategory.id])
      toast.success('分类创建成功')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '创建分类失败')
    }
  })

  return (
    <FormItem>
      <FormLabel>分类</FormLabel>
      <FormControl>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value?.length && "text-muted-foreground"
              )}
            >选择分类</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="搜索分类..." />
              <CommandEmpty>
                没有找到分类
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full justify-start"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  创建新分类
                </Button>
              </CommandEmpty>
              <CommandGroup>
                {categories?.map((category: Category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => {
                      const current = new Set(value)
                      if (current.has(category.id)) {
                        current.delete(category.id)
                      } else {
                        current.add(category.id)
                      }
                      onChange(Array.from(current))
                    }}
                  >
                    <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                {isCreating ? (
                  <div className="p-2 flex items-center gap-2">
                    <Input className="text-sm"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="输入分类名称"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCategoryName) {
                          e.preventDefault()
                          submitCategory(newCategoryName)
                        } else if (e.key === 'Escape') {
                          setIsCreating(false)
                          setNewCategoryName('')
                        }
                      }}
                      autoFocus
                    />
                    <Button size="sm" disabled={!newCategoryName}
                      onClick={() => submitCategory(newCategoryName)}
                    >
                      创建
                    </Button>
                  </div>
                ) : (
                  <CommandItem
                    onSelect={() => setIsCreating(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    创建新分类
                  </CommandItem>
                )}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      <div className="mt-2 flex flex-wrap gap-1">
        {value?.map((categoryId) => {
          const category = categories?.find((c: Category) => c.id === categoryId)
          if (!category) return null
          return (
            <Badge key={category.id} className="gap-1" style={{
              backgroundColor: `${category.color}20`,
              color: category.color
            }}>
              {category.name}
              <X className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const current = new Set(value)
                  current.delete(category.id)
                  onChange(Array.from(current))
                }}
              />
            </Badge>
          )
        })}
      </div>
      <FormMessage />
    </FormItem>
  )
} 