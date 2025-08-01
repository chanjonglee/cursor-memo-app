'use client'

import React, { createContext, useContext, useCallback, useState, useEffect, useMemo } from 'react'
import { Memo, MemoFormData } from '@/types/memo'
import { supabaseUtils } from '@/utils/supabaseUtils'

interface MemoContextType {
  // 상태
  memos: Memo[]
  allMemos: Memo[]
  loading: boolean
  searchQuery: string
  selectedCategory: string
  stats: {
    total: number
    byCategory: Record<string, number>
    filtered: number
  }

  // 메모 CRUD
  createMemo: (formData: MemoFormData) => Promise<Memo>
  updateMemo: (id: string, formData: MemoFormData) => Promise<void>
  deleteMemo: (id: string) => Promise<void>
  getMemoById: (id: string) => Memo | undefined
  
  // 폼 제출용 래퍼 함수들
  handleCreateMemo: (formData: MemoFormData) => Promise<void>
  handleUpdateMemo: (id: string) => (formData: MemoFormData) => Promise<void>

  // 필터링 & 검색
  searchMemos: (query: string) => void
  filterByCategory: (category: string) => void

  // 유틸리티
  clearAllMemos: () => Promise<void>
  refreshMemos: () => Promise<void>
}

const MemoContext = createContext<MemoContextType | undefined>(undefined)

export const useMemoContext = () => {
  const context = useContext(MemoContext)
  if (context === undefined) {
    throw new Error('useMemoContext must be used within a MemoProvider')
  }
  return context
}

interface MemoProviderProps {
  children: React.ReactNode
}

export const MemoProvider: React.FC<MemoProviderProps> = ({ children }) => {
  const [allMemos, setAllMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 메모 로드
  const refreshMemos = useCallback(async () => {
    setLoading(true)
    try {
      const loadedMemos = await supabaseUtils.getMemos()
      setAllMemos(loadedMemos)
    } catch (error) {
      console.error('Failed to load memos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 초기 로드
  useEffect(() => {
    refreshMemos()
  }, [refreshMemos])

  // 메모 생성
  const createMemo = useCallback(async (formData: MemoFormData): Promise<Memo> => {
    try {
      const createdMemo = await supabaseUtils.addMemo(formData)
      if (createdMemo) {
        setAllMemos(prev => [createdMemo, ...prev])
        return createdMemo
      }
      throw new Error('Failed to create memo')
    } catch (error) {
      console.error('Error creating memo:', error)
      throw error
    }
  }, [])

  // 메모 업데이트
  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData): Promise<void> => {
      const existingMemo = allMemos.find(memo => memo.id === id)
      if (!existingMemo) {
        throw new Error('Memo not found')
      }

      const updatedMemo: Memo = {
        ...existingMemo,
        ...formData,
        updatedAt: new Date().toISOString(),
      }

      try {
        const result = await supabaseUtils.updateMemo(updatedMemo)
        if (result) {
          setAllMemos(prev => prev.map(memo => (memo.id === id ? result : memo)))
        }
      } catch (error) {
        console.error('Error updating memo:', error)
        throw error
      }
    },
    [allMemos]
  )

  // 메모 삭제
  const deleteMemo = useCallback(async (id: string): Promise<void> => {
    try {
      await supabaseUtils.deleteMemo(id)
      setAllMemos(prev => prev.filter(memo => memo.id !== id))
    } catch (error) {
      console.error('Error deleting memo:', error)
      throw error
    }
  }, [])

  // 메모 검색
  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  // 카테고리 필터링
  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  // 특정 메모 가져오기
  const getMemoById = useCallback(
    (id: string): Memo | undefined => {
      return allMemos.find(memo => memo.id === id)
    },
    [allMemos]
  )

  // 폼 제출용 래퍼 함수들 - React 19 pattern 지원
  const handleCreateMemo = useCallback(async (formData: MemoFormData): Promise<void> => {
    await createMemo(formData)
  }, [createMemo])

  const handleUpdateMemo = useCallback((id: string) => {
    return async (formData: MemoFormData): Promise<void> => {
      await updateMemo(id, formData)
    }
  }, [updateMemo])

  // 필터링된 메모 목록
  const filteredMemos = useMemo(() => {
    let filtered = allMemos

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [allMemos, selectedCategory, searchQuery])

  // 모든 메모 삭제
  const clearAllMemos = useCallback(async (): Promise<void> => {
    try {
      await supabaseUtils.clearMemos()
      setAllMemos([])
      setSearchQuery('')
      setSelectedCategory('all')
    } catch (error) {
      console.error('Error clearing all memos:', error)
      throw error
    }
  }, [])

  // 통계 정보
  const stats = useMemo(() => {
    const totalMemos = allMemos.length
    const categoryCounts = allMemos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [allMemos, filteredMemos])

  const value: MemoContextType = {
    // 상태
    memos: filteredMemos,
    allMemos,
    loading,
    searchQuery,
    selectedCategory,
    stats,

    // 메모 CRUD
    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,

    // 폼 제출용 래퍼 함수들
    handleCreateMemo,
    handleUpdateMemo,

    // 필터링 & 검색
    searchMemos,
    filterByCategory,

    // 유틸리티
    clearAllMemos,
    refreshMemos,
  }

  return <MemoContext.Provider value={value}>{children}</MemoContext.Provider>
}