'use client'

import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import React from 'react'

interface MemoItemProps {
  memo: Memo
  onView: (memo: Memo) => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoItem({ memo, onView, onEdit, onDelete }: MemoItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(memo)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col"
    >
      <div className="p-6 flex-grow cursor-pointer" onClick={() => onView(memo)}>
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {memo.title}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
              >
                {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                  memo.category}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(memo.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* 내용 */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {memo.content}
          </p>
        </div>

        {/* 태그 */}
        {memo.tags && memo.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {memo.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* 푸터 */}
      <div className="border-t border-gray-100 px-6 py-3 flex justify-end items-center gap-4">
        <button
          onClick={handleEdit}
          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  )
}
