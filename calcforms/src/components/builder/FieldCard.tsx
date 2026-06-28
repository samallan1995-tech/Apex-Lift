'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FormField } from '@/lib/types'

const TYPE_ICONS: Record<string, string> = {
  text: '✏️', number: '#', currency: '£', select: '▾', date: '📅',
  file: '📎', heading: 'H', paragraph: '¶', formula: '∑',
}

export default function FieldCard({
  field, isSelected, onSelect, onDelete, isDragging
}: {
  field: FormField
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  isDragging: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border-2 transition-all cursor-pointer ${
        isSelected ? 'border-indigo-400 shadow-md shadow-indigo-100' : 'border-gray-100 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 p-3.5">
        <div
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing p-1 -ml-1"
          onClick={e => e.stopPropagation()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM16 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM16 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM16 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
        </div>
        <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
          {TYPE_ICONS[field.type] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium truncate ${field.type === 'heading' ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
            {field.label}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {field.type} {field.required ? '· required' : ''}
            {field.id && <span className="font-mono text-gray-300 ml-1">#{field.id.slice(0, 6)}</span>}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
