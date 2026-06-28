'use client'
import { useState, useCallback, useRef } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Form, FormField, Formula, FieldType } from '@/lib/types'
import { evaluateFormulas, shouldShowField } from '@/lib/formula-engine'
import FieldCard from './FieldCard'
import FieldEditor from './FieldEditor'
import FormulaPanel from './FormulaPanel'
import ThemePanel from './ThemePanel'
import AIGenerateModal from './AIGenerateModal'
import FormPreview from '@/components/form-renderer/FormPreview'
import { nanoid } from './nanoid'

const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: '✏️' },
  { type: 'number', label: 'Number', icon: '#' },
  { type: 'currency', label: 'Currency', icon: '£' },
  { type: 'select', label: 'Dropdown', icon: '▾' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'file', label: 'File Upload', icon: '📎' },
  { type: 'heading', label: 'Heading', icon: 'H' },
  { type: 'paragraph', label: 'Paragraph', icon: '¶' },
]

type Panel = 'fields' | 'logic' | 'formulas' | 'theme'

export default function FormBuilder({ initialForm }: { initialForm: Form }) {
  const [form, setForm] = useState<Form>(initialForm)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<Panel>('fields')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [previewValues, setPreviewValues] = useState<Record<string, string | number | null>>({})
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const fields = form.schema?.fields || []
  const formulas = form.formulas || []

  const selectedField = fields.find(f => f.id === selectedFieldId) ?? null

  // Computed values for preview
  const computedValues = evaluateFormulas(
    formulas.map(f => ({ name: f.name, fieldId: f.fieldId, expression: f.expression })),
    previewValues
  )

  function updateField(updatedField: FormField) {
    setForm(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        fields: prev.schema.fields.map(f => f.id === updatedField.id ? updatedField : f),
      },
    }))
    scheduleSave()
  }

  function addField(type: FieldType) {
    const id = nanoid()
    const newField: FormField = {
      id,
      type,
      label: type === 'heading' ? 'Section heading' : type === 'paragraph' ? 'Paragraph text' : `New ${type} field`,
      required: false,
      ...(type === 'select' ? { options: [{ label: 'Option 1', value: 'option_1' }] } : {}),
    }
    setForm(prev => ({
      ...prev,
      schema: { ...prev.schema, fields: [...prev.schema.fields, newField] },
    }))
    setSelectedFieldId(id)
    setActivePanel('fields')
    scheduleSave()
  }

  function removeField(id: string) {
    setForm(prev => ({
      ...prev,
      schema: { ...prev.schema, fields: prev.schema.fields.filter(f => f.id !== id) },
    }))
    if (selectedFieldId === id) setSelectedFieldId(null)
    scheduleSave()
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex(f => f.id === active.id)
    const newIndex = fields.findIndex(f => f.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const newFields = arrayMove(fields, oldIndex, newIndex)
    setForm(prev => ({ ...prev, schema: { ...prev.schema, fields: newFields } }))
    scheduleSave()
  }

  function updateFormulas(newFormulas: Formula[]) {
    setForm(prev => ({ ...prev, formulas: newFormulas }))
    scheduleSave()
  }

  function updateTitle(title: string) {
    setForm(prev => ({ ...prev, title }))
    scheduleSave()
  }

  function updateTheme(theme: Form['theme']) {
    setForm(prev => ({ ...prev, theme }))
    scheduleSave()
  }

  function scheduleSave() {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => saveForm(), 1500)
  }

  async function saveForm() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('forms').update({
      title: form.title,
      schema: form.schema,
      formulas: form.formulas,
      theme: form.theme,
      status: form.status,
    }).eq('id', form.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function togglePublish() {
    const newStatus = form.status === 'published' ? 'draft' : 'published'
    setForm(prev => ({ ...prev, status: newStatus }))
    const supabase = createClient()
    await supabase.from('forms').update({ status: newStatus }).eq('id', form.id)
  }

  function applyAISchema(schema: { fields: FormField[] }, aiFormulas: Formula[]) {
    setForm(prev => ({ ...prev, schema, formulas: aiFormulas }))
    setShowAI(false)
    scheduleSave()
  }

  const panelTabs: { key: Panel; label: string }[] = [
    { key: 'fields', label: 'Fields' },
    { key: 'formulas', label: 'Formulas' },
    { key: 'theme', label: 'Theme' },
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/forms')} className="text-gray-400 hover:text-gray-600 text-sm transition-colors">← Back</button>
          <div className="w-px h-4 bg-gray-200" />
          <input
            type="text"
            value={form.title}
            onChange={e => updateTitle(e.target.value)}
            className="font-semibold text-gray-900 text-sm bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1 py-0.5 min-w-0 max-w-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${saving ? 'text-gray-400' : saved ? 'text-green-600' : 'text-transparent'}`}>
            {saving ? 'Saving...' : 'Saved'}
          </span>
          <button onClick={() => setShowAI(true)} className="text-xs font-medium px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
            ✨ AI Generate
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="text-xs font-medium px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
            {showPreview ? 'Hide preview' : 'Preview'}
          </button>
          <button
            onClick={togglePublish}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              form.status === 'published'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {form.status === 'published' ? '● Published' : 'Publish'}
          </button>
          {form.status === 'published' && (
            <a href={`/f/${form.public_slug}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-indigo-600 hover:underline">
              View live ↗
            </a>
          )}
          <button onClick={saveForm} disabled={saving} className="text-xs font-medium px-3 py-1.5 bg-gray-900 text-white hover:bg-gray-700 rounded-lg transition-colors">
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
          {/* Panel tabs */}
          <div className="flex border-b border-gray-100">
            {panelTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActivePanel(tab.key)}
                className={`flex-1 text-xs font-medium py-3 transition-colors ${
                  activePanel === tab.key
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Fields panel */}
          {activePanel === 'fields' && (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Add field</div>
              <div className="grid grid-cols-2 gap-1.5">
                {FIELD_TYPES.map(ft => (
                  <button
                    key={ft.type}
                    onClick={() => addField(ft.type)}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 text-center transition-all group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{ft.icon}</span>
                    <span className="text-xs text-gray-600 group-hover:text-indigo-700 font-medium">{ft.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formulas panel */}
          {activePanel === 'formulas' && (
            <FormulaPanel
              formulas={formulas}
              fields={fields}
              onChange={updateFormulas}
            />
          )}

          {/* Theme panel */}
          {activePanel === 'theme' && (
            <ThemePanel
              theme={form.theme}
              onChange={updateTheme}
            />
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto py-8 px-4">
            {fields.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">➕</div>
                <h3 className="font-semibold text-gray-900 mb-1">No fields yet</h3>
                <p className="text-gray-400 text-sm">Click a field type in the left panel to add it, or use AI Generate.</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {fields.map(field => (
                      <FieldCard
                        key={field.id}
                        field={field}
                        isSelected={selectedFieldId === field.id}
                        onSelect={() => {
                          setSelectedFieldId(field.id)
                          setActivePanel('fields')
                        }}
                        onDelete={() => removeField(field.id)}
                        isDragging={activeId === field.id}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div className="bg-white border-2 border-indigo-400 rounded-xl p-4 shadow-lg opacity-90">
                      <div className="text-sm font-medium text-gray-700">
                        {fields.find(f => f.id === activeId)?.label}
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>

        {/* Right panel: field editor */}
        {selectedField && (
          <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto shrink-0">
            <FieldEditor
              field={selectedField}
              allFields={fields}
              onChange={updateField}
              onClose={() => setSelectedFieldId(null)}
            />
          </div>
        )}

        {/* Preview panel */}
        {showPreview && (
          <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto shrink-0">
            <div className="p-3 border-b border-gray-200 bg-white">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Preview</div>
            </div>
            <div className="p-4">
              <FormPreview
                form={form}
                values={previewValues}
                computed={computedValues}
                onChange={(fieldId, value) => setPreviewValues(prev => ({ ...prev, [fieldId]: value }))}
              />
            </div>
          </div>
        )}
      </div>

      {showAI && (
        <AIGenerateModal
          onApply={applyAISchema}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  )
}
