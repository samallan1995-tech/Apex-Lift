'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const [org, setOrg] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', brand_color: '#4f46e5', brand_logo: '', white_label_domain: '' })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('orgs').select('*').eq('owner_id', user.id).single()
      if (data) {
        setOrg(data)
        setForm({
          name: data.name || '',
          brand_color: data.brand_color || '#4f46e5',
          brand_logo: data.brand_logo || '',
          white_label_domain: data.white_label_domain || '',
        })
      }
    }
    load()
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('orgs').update({
      name: form.name,
      brand_color: form.brand_color,
      brand_logo: form.brand_logo || null,
      white_label_domain: form.white_label_domain || null,
    }).eq('id', org.id)

    if (error) { setError(error.message); setSaving(false); return }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!org) return (
    <div className="p-8 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your firm's branding and account</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
      )}

      <form onSubmit={save} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Firm details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Firm name</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand colour</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.brand_color}
                onChange={e => setForm(p => ({ ...p, brand_color: e.target.value }))}
                className="h-10 w-16 rounded border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                value={form.brand_color}
                onChange={e => setForm(p => ({ ...p, brand_color: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="#4f46e5"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Used on public forms and PDF headers</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
            <input
              type="url"
              value={form.brand_logo}
              onChange={e => setForm(p => ({ ...p, brand_logo: e.target.value }))}
              placeholder="https://yourfirm.com/logo.png"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {form.brand_logo && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg inline-block">
                <img src={form.brand_logo} alt="Logo preview" className="h-8 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>
        </div>

        {org.plan === 'firm' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">White-label domain</h2>
              <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full">Firm plan</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom domain</label>
              <input
                value={form.white_label_domain}
                onChange={e => setForm(p => ({ ...p, white_label_domain: e.target.value }))}
                placeholder="forms.yourfirm.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Point a CNAME from this domain to your deployment URL, then add this domain in Vercel/your host.
              </p>
            </div>
          </div>
        )}

        {org.plan !== 'firm' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-700 text-sm">White-label domain</div>
              <div className="text-xs text-gray-400 mt-0.5">Available on the Firm plan</div>
            </div>
            <Link href="/dashboard/billing" className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
              Upgrade →
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
