"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CategoryForm } from "./CategoryForm"
import { toast } from "sonner"
import { fetchCategories, deleteCategory, type Category } from "@/lib/http"

export function CategoryManager() {
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null)
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false)
  const [showAddEditForm, setShowAddEditForm] = React.useState(false)
  const queryClient = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  })

  const { mutate: submitDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('删除成功')
      setShowDeleteAlert(false)
      setSelectedCategory(null)
    },
    onError: (error) => {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : '删除失败')
      setShowDeleteAlert(false)
    }
  })

  const handleDelete = (category: Category) => {
    setSelectedCategory(category)
    setShowDeleteAlert(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setShowAddEditForm(true)
  }

  if (isLoading) {
    return <div className="text-center">加载中...</div>
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">分类管理</h2>
        <Button onClick={() => setShowAddEditForm(true)}>
          添加分类
        </Button>
      </div>

      <ScrollArea className="max-h-[400px] rounded-md py-4">
        <div className="space-y-4">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between px-2 rounded-lg border"
              style={{ borderColor: category.color }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs">{category.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="link"
                  size="sm"
                  className="px-1"
                  onClick={() => handleEdit(category)}
                >
                  编辑
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="text-red-500 px-1"
                  onClick={() => handleDelete(category)}
                >
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除分类 `{selectedCategory?.name}` 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCategory && submitDelete(selectedCategory.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showAddEditForm} onOpenChange={setShowAddEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "编辑分类" : "添加分类"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={selectedCategory || undefined}
            onSuccess={() => {
              setShowAddEditForm(false)
              setSelectedCategory(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 
