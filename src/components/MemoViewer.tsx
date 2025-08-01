
import React, { useEffect } from 'react';
import { Memo } from '@/types/memo';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const Markdown = dynamic(
  () => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), 
  { ssr: false }
);



interface MemoViewerProps {
  memo: Memo;
  onClose: () => void;
  onEdit: (memo: Memo) => void;
  onDelete: (id: string) => Promise<void> | void;
}

const MemoViewer: React.FC<MemoViewerProps> = ({ memo, onClose, onEdit, onDelete }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{memo.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-gray-600"><strong>카테고리:</strong> {memo.category}</p>
          {memo.tags && memo.tags.length > 0 && (
            <p className="text-gray-600"><strong>태그:</strong> {memo.tags.join(', ')}</p>
          )}
        </div>
        <div data-color-mode="light" className="bg-gray-50 p-4 rounded-md mb-4 max-h-80 overflow-y-auto">
          <Markdown source={memo.content} />
        </div>
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => onEdit(memo)} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <FaEdit className="mr-2" /> 편집
          </button>
          <button 
            onClick={() => onDelete(memo.id)} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
          >
            <FaTrash className="mr-2" /> 삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoViewer;
