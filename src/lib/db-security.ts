// All database queries already use Supabase's
// parameterized queries which prevent SQL injection.
// This file adds extra validation on top.

const SQL_INJECTION_PATTERNS = [
  /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
  /(--|\/\*|\*\/|xp_|EXEC\s|EXECUTE\s)/i,
  /(\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/i,
  /('.*'|".*")\s*(=|<|>)/i,
]

const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /<iframe[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /eval\s*\(/gi,
  /document\.(cookie|write|location)/gi,
]

export function containsSQLInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => 
    pattern.test(input)
  )
}

export function containsXSS(input: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(input))
}

export function isMalicious(input: string): boolean {
  return containsSQLInjection(input) || containsXSS(input)
}

export function deepSanitize(obj: Record<string, any>): void {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      if (isMalicious(obj[key])) {
        throw new Error(`Malicious input detected in field: ${key}`)
      }
      obj[key] = obj[key]
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      deepSanitize(obj[key])
    }
  }
}
