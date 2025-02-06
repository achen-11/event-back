'use client'

import type { EventQuery, Category } from "@/types"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function FilterFieldsBar({
  searchQuery,
  setSelectedCategory,
  setKeyword,
  categories,
}: {
  searchQuery: EventQuery;
  setSelectedCategory: (category: string) => void;
  setKeyword: (keyword: string) => void;
  categories: Category[];
}) {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 ">
        {/* 分类选择器 */}
        <div className="flex items-center gap-2 flex-1 md:flex-none">
          {/* <Filter className="h-4 w-4 text-muted-foreground" /> */}
          <Select value={searchQuery.category} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* 搜索框 */}
        <div className="flex items-center gap-2">

          <div
            className="border h-9 w-9 flex items-center justify-center rounded-lg cursor-pointer"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
      <div className={cn(
        "transition-all duration-300 mt-3",
        showSearch ? "block" : "hidden"
      )}>
        <Input
          type="search"
          placeholder="搜索..."
          value={searchQuery.keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full"
        />
      </div>
    </>
  )
}