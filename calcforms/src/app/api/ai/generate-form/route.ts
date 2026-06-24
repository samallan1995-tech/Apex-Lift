import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an expert form builder for professional services firms. Given a plain-English description, generate a complete form schema and formula set as JSON.

Return ONLY valid JSON with this exact structure:
{
  "schema": {
    "fields": [
      {
        "id": "f1",
        "type": "heading|text|number|currency|select|date|file|paragraph",
        "label": "Field Label",
        "required": true|false,
        "placeholder": "optional",
        "helpText": "optional",
        "options": [{"label": "Option", "value": "option_value"}],
        "prefix": "£",
        "min": 0,
        "max": 1000000
      }
    ]
  },
  "formulas": [
    {
      "name": "formula_variable_name",
      "fieldId": "calc_unique_id",
      "expression": "field_id * other_field_id",
      "label": "Display Label",
      "format": "currency|number|percentage"
    }
  ]
}

Rules:
- Field IDs must be short alphanumeric (f1, f2, f3...) — these are referenced in formulas
- Formula names must be snake_case (base_fee, vat_amount, total_fee)
- Formula fieldIds must be unique (calc_1, calc_2...)
- Expressions reference field IDs or other formula names
- Use IF(condition, then, else) for conditional formulas
- Always include UK VAT at 20% where appropriate (subtotal * 0.2)
- Always include a total formula
- Include a heading field at the start
- Include contact fields (name, email) at the end
- Select fields need options array
- Currency fields should have prefix "£"
- Keep it practical: 6-10 fields, 4-8 formulas`

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { description } = await request.json()
  if (!description?.trim()) return NextResponse.json({ error: 'Description required' }, { status: 400 })

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Generate a professional services form for: "${description}"\n\nReturn only the JSON, no explanation.`,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    // Extract JSON from response (handle code blocks)
    let jsonStr = content.text.trim()
    const codeBlockMatch = jsonStr.match(/```(?:json)?\n?([\s\S]*?)```/)
    if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim()

    const parsed = JSON.parse(jsonStr)

    // Validate structure
    if (!parsed.schema?.fields || !Array.isArray(parsed.schema.fields)) {
      throw new Error('Invalid schema returned')
    }
    if (!Array.isArray(parsed.formulas)) {
      parsed.formulas = []
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 })
  }
}
