'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  value: string
  onChange: (value?: string) => void
  className?: string
}

export function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-disc space-y-1',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-decimal space-y-1',
          },
        },
      }),
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
          class: 'bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded-sm',
        },
      }),
      TaskList,
      TaskItem,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none px-2 py-1 focus-visible:outline-none',
      }
    },
    immediatelyRender: false
  })

  if (!editor) {
    return null
  }

  return (
    <div 
      className={cn("rounded-md border", className)}
      onKeyDown={(e) => {
        e.stopPropagation()
      }}
    >
      <EditorContent editor={editor} />
    </div>
  )
} 