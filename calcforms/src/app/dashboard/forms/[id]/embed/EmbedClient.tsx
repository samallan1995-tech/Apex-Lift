'use client'
import { useState } from 'react'

export default function EmbedClient({ formSlug, appUrl }: { formSlug: string; appUrl: string }) {
  const [copied, setCopied] = useState<string | null>(null)
  const shareUrl = `${appUrl}/f/${formSlug}`
  const iframeSnippet = `<iframe src="${shareUrl}" width="100%" height="800" frameborder="0" style="border:none;border-radius:12px;box-shadow:0 2px 20px rgba(0,0,0,0.08)"></iframe>`
  const scriptSnippet = `<div id="calcform-${formSlug}"></div>\n<script src="${appUrl}/embed.js" data-form="${formSlug}" async></script>`

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Share link */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Share link</h2>
        <p className="text-sm text-gray-500 mb-4">Send this link directly to clients or share on your website.</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 font-mono text-gray-700"
          />
          <button
            onClick={() => copy(shareUrl, 'link')}
            className="px-4 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {copied === 'link' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <a href={shareUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline mt-2 inline-block">
          Open in new tab ↗
        </a>
      </div>

      {/* iFrame embed */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Embed (iFrame)</h2>
        <p className="text-sm text-gray-500 mb-4">Paste this snippet into any web page HTML to embed the form.</p>
        <div className="bg-gray-900 rounded-lg p-4 relative">
          <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">{iframeSnippet}</pre>
          <button
            onClick={() => copy(iframeSnippet, 'iframe')}
            className="absolute top-3 right-3 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2.5 py-1.5 rounded transition-colors"
          >
            {copied === 'iframe' ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Script embed */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Embed (Script tag)</h2>
        <p className="text-sm text-gray-500 mb-4">More flexible — automatically sizes to content. Paste before <code className="bg-gray-100 px-1 rounded text-xs">&lt;/body&gt;</code>.</p>
        <div className="bg-gray-900 rounded-lg p-4 relative">
          <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">{scriptSnippet}</pre>
          <button
            onClick={() => copy(scriptSnippet, 'script')}
            className="absolute top-3 right-3 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2.5 py-1.5 rounded transition-colors"
          >
            {copied === 'script' ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* QR code note */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-sm text-indigo-700">
        <strong>Tip:</strong> Use a QR code generator to turn the share link into a scannable code for print materials, reception desks, or email footers.
      </div>
    </div>
  )
}
