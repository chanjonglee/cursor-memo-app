import { supabase } from '@/lib/supabase'
import { Memo, MemoFormData, MemoRow } from '@/types/memo'

// 데이터베이스 행을 클라이언트 Memo 타입으로 변환
const transformRowToMemo = (row: MemoRow): Memo => ({
  id: row.id,
  title: row.title,
  content: row.content,
  category: row.category,
  tags: row.tags || [],
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
})

// 클라이언트 MemoFormData 타입을 데이터베이스 삽입용으로 변환
const transformFormDataToInsert = (formData: MemoFormData) => ({
  title: formData.title,
  content: formData.content,
  category: formData.category,
  tags: formData.tags,
})

export const supabaseUtils = {
  // 모든 메모 가져오기
  getMemos: async (): Promise<Memo[]> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching memos:', error)
        throw error
      }

      return data ? data.map(transformRowToMemo) : []
    } catch (error) {
      console.error('Error loading memos from Supabase:', error)
      return []
    }
  },

  // 메모 추가
  addMemo: async (formData: MemoFormData): Promise<Memo | null> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .insert(transformFormDataToInsert(formData))
        .select()
        .single()

      if (error) {
        console.error('Error adding memo:', error)
        throw error
      }

      return data ? transformRowToMemo(data) : null
    } catch (error) {
      console.error('Error adding memo to Supabase:', error)
      throw error
    }
  },

  // 메모 업데이트
  updateMemo: async (updatedMemo: Memo): Promise<Memo | null> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .update({
          title: updatedMemo.title,
          content: updatedMemo.content,
          category: updatedMemo.category,
          tags: updatedMemo.tags,
          updated_at: updatedMemo.updatedAt,
        })
        .eq('id', updatedMemo.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating memo:', error)
        throw error
      }

      return data ? transformRowToMemo(data) : null
    } catch (error) {
      console.error('Error updating memo in Supabase:', error)
      throw error
    }
  },

  // 메모 삭제
  deleteMemo: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting memo:', error)
        throw error
      }
    } catch (error) {
      console.error('Error deleting memo from Supabase:', error)
      throw error
    }
  },

  // 메모 검색
  searchMemos: async (query: string): Promise<Memo[]> => {
    try {
      if (!query.trim()) {
        return await supabaseUtils.getMemos()
      }

      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching memos:', error)
        throw error
      }

      return data ? data.map(transformRowToMemo) : []
    } catch (error) {
      console.error('Error searching memos in Supabase:', error)
      return []
    }
  },

  // 카테고리별 메모 필터링
  getMemosByCategory: async (category: string): Promise<Memo[]> => {
    try {
      if (category === 'all') {
        return await supabaseUtils.getMemos()
      }

      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error filtering memos by category:', error)
        throw error
      }

      return data ? data.map(transformRowToMemo) : []
    } catch (error) {
      console.error('Error filtering memos by category in Supabase:', error)
      return []
    }
  },

  // 특정 메모 가져오기
  getMemoById: async (id: string): Promise<Memo | null> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null
        }
        console.error('Error fetching memo by ID:', error)
        throw error
      }

      return data ? transformRowToMemo(data) : null
    } catch (error) {
      console.error('Error fetching memo by ID from Supabase:', error)
      return null
    }
  },

  // 모든 메모 삭제
  clearMemos: async (): Promise<void> => {
    try {
      const { error } = await supabase
        .from('memos')
        .delete()
        .neq('id', '')  // 모든 행 삭제

      if (error) {
        console.error('Error clearing all memos:', error)
        throw error
      }
    } catch (error) {
      console.error('Error clearing memos from Supabase:', error)
      throw error
    }
  },
}