'use client'

import { useState } from 'react'
import { useMemoContext } from '@/context/MemoContext'
import { Memo, MemoFormData } from '@/types/memo'
import MemoList from '@/components/MemoList'
import MemoForm from '@/components/MemoForm'

export default function Home() {
  const {
    memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,
    handleCreateMemo,
    handleUpdateMemo,
    deleteMemo,
    searchMemos,
    filterByCategory,
  } = useMemoContext()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null)

  const handleCreateMemoSubmit = async (formData: MemoFormData) => {
    try {
      await handleCreateMemo(formData)
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to create memo:', error)
      throw error // Re-throw to let form handle the error
    }
  }

  const handleUpdateMemoSubmit = async (formData: MemoFormData) => {
    if (editingMemo) {
      try {
        await handleUpdateMemo(editingMemo.id)(formData)
        setEditingMemo(null)
        setIsFormOpen(false)
      } catch (error) {
        console.error('Failed to update memo:', error)
        throw error // Re-throw to let form handle the error
      }
    }
  }

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingMemo(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 헤더 - Tailwind CSS 4 새로운 패턴 적용 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                메모 앱
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFormOpen(true)}
                className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                새 메모
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 - Tailwind CSS 4 컨테이너 쿼리 활용 */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 @container">
        <MemoList
          memos={memos}
          loading={loading}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={searchMemos}
          onCategoryChange={filterByCategory}
          onEditMemo={handleEditMemo}
          onDeleteMemo={async (id: string) => {
            try {
              await deleteMemo(id)
            } catch (error) {
              console.error('Failed to delete memo:', error)
            }
          }}
          stats={stats}
        />
      </main>

      {/* 모달 폼 */}
      <MemoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingMemo ? handleUpdateMemoSubmit : handleCreateMemoSubmit}
        editingMemo={editingMemo}
      />
    </div>
  )
}
