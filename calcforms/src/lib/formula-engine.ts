import { create, all } from 'mathjs'

const math = create(all)

// Limit scope to safe operations only
math.import({
  import: function () { throw new Error('Function import is disabled') },
  createUnit: function () { throw new Error('Function createUnit is disabled') },
  evaluate: function () { throw new Error('Function evaluate is disabled') },
  parse: function () { throw new Error('Function parse is disabled') },
  simplify: function () { throw new Error('Function simplify is disabled') },
  derivative: function () { throw new Error('Function derivative is disabled') },
}, { override: true })

export interface FormulaField {
  id: string
  value: number | string | null
}

export interface Formula {
  name: string
  fieldId: string
  expression: string
}

export interface EvalResult {
  [fieldId: string]: number | string | null
}

export function evaluateFormulas(
  formulas: Formula[],
  fieldValues: Record<string, number | string | null>
): EvalResult {
  const results: EvalResult = {}
  const scope: Record<string, number | string | null> = { ...fieldValues }

  // Topological eval: try each formula up to N passes to resolve dependencies
  const remaining = [...formulas]
  let passes = 0
  const maxPasses = formulas.length + 1

  while (remaining.length > 0 && passes < maxPasses) {
    passes++
    const stillRemaining: Formula[] = []

    for (const formula of remaining) {
      try {
        const result = evaluateSingle(formula.expression, scope)
        results[formula.fieldId] = result
        scope[formula.name] = result
        scope[formula.fieldId] = result
      } catch {
        stillRemaining.push(formula)
      }
    }

    if (stillRemaining.length === remaining.length) break
    remaining.splice(0, remaining.length, ...stillRemaining)
  }

  // Remaining failed formulas get null
  for (const f of remaining) {
    results[f.fieldId] = null
  }

  return results
}

function evaluateSingle(expression: string, scope: Record<string, number | string | null>): number | string | null {
  // Replace IF/ELSE with ternary syntax
  const normalized = normalizeExpression(expression)

  // Build a clean numeric scope
  const numericScope: Record<string, number> = {}
  for (const [k, v] of Object.entries(scope)) {
    const n = typeof v === 'number' ? v : parseFloat(String(v))
    if (!isNaN(n)) numericScope[k] = n
    else numericScope[k] = 0
  }

  try {
    const result = math.evaluate(normalized, numericScope)
    if (typeof result === 'number') {
      return Math.round(result * 100) / 100
    }
    return result
  } catch (e) {
    throw new Error(`Cannot evaluate: ${expression}`)
  }
}

function normalizeExpression(expr: string): string {
  // IF(condition, then, else) -> (condition ? then : else)
  let result = expr.replace(/\bIF\s*\(([^,]+),([^,]+),([^)]+)\)/gi, '($1 ? $2 : $3)')
  // ROUND(x, n) -> round(x, n)
  result = result.replace(/\bROUND\b/gi, 'round')
  // ABS(x)
  result = result.replace(/\bABS\b/gi, 'abs')
  // MIN/MAX
  result = result.replace(/\bMIN\b/gi, 'min')
  result = result.replace(/\bMAX\b/gi, 'max')
  return result
}

export function evaluateCondition(
  condition: ConditionalRule,
  fieldValues: Record<string, number | string | null>
): boolean {
  const value = fieldValues[condition.fieldId]
  const target = condition.value

  switch (condition.operator) {
    case 'equals': return String(value) === String(target)
    case 'not_equals': return String(value) !== String(target)
    case 'greater_than': return Number(value) > Number(target)
    case 'less_than': return Number(value) < Number(target)
    case 'contains': return String(value ?? '').includes(String(target))
    case 'is_empty': return value === null || value === '' || value === undefined
    case 'is_not_empty': return value !== null && value !== '' && value !== undefined
    default: return true
  }
}

export interface ConditionalRule {
  fieldId: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_empty' | 'is_not_empty'
  value?: string | number
}

export interface ConditionalLogic {
  action: 'show' | 'hide'
  match: 'all' | 'any'
  rules: ConditionalRule[]
}

export function shouldShowField(
  logic: ConditionalLogic | undefined,
  fieldValues: Record<string, number | string | null>
): boolean {
  if (!logic || !logic.rules || logic.rules.length === 0) return true

  const results = logic.rules.map(rule => evaluateCondition(rule, fieldValues))
  const conditionMet = logic.match === 'all' ? results.every(Boolean) : results.some(Boolean)

  return logic.action === 'show' ? conditionMet : !conditionMet
}
