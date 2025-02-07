'use client'

import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

interface MarkdownEditorProps {
  value: string
  onChange: (value?: string) => void
  className?: string
}

export function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("min-h-[200px] font-mono", className)}
      placeholder="支持 Markdown 语法
# 标题
- 无序列表
1. 有序列表
- [ ] 待办事项"
    />
  )
} 