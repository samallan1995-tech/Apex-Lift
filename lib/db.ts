import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | null = null

function getSql(): ReturnType<typeof postgres> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    _sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })
  }
  return _sql
}

export const sql: ReturnType<typeof postgres> = new Proxy({} as ReturnType<typeof postgres>, {
  apply(_target, _thisArg, args) {
    return (getSql() as unknown as (...a: unknown[]) => unknown)(...args)
  },
  get(_target, prop) {
    return (getSql() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
