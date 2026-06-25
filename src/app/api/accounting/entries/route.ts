import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function queryDB(sql: string, params?: any[]) {
  const { Pool } = require('pg')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const result = await pool.query(sql, params)
    return result.rows
  } finally {
    await pool.end()
  }
}

function normalizeRow(row: any): any {
  if (!row) return row
  const out: any = {}
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v
  }
  return out
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const rows = await queryDB(`
      SELECT
        e.id,
        e."journalId" AS journal_id,
        e.date,
        e.reference,
        e.label,
        e."createdAt" AS created_at,
        el.id AS line_id,
        el."entryId" AS entry_id,
        el."accountId" AS account_id,
        el."accountCode" AS account_code,
        el."accountLabel" AS account_label,
        el.debit,
        el.credit
      FROM "Entry" e
      LEFT JOIN "EntryLine" el ON el."entryId" = e.id
      ORDER BY e.date DESC, e.id DESC
      LIMIT 50
    `)

    // Regroup lines per entry
    const entryMap = new Map<string, any>()
    for (const row of rows) {
      const entryId = row.id
      if (!entryMap.has(entryId)) {
        entryMap.set(entryId, {
          id: row.id,
          journalId: row.journal_id,
          date: row.date,
          reference: row.reference,
          label: row.label,
          createdAt: row.created_at,
          lines: [],
        })
      }
      if (row.line_id) {
        entryMap.get(entryId).lines.push({
          id: row.line_id,
          entryId: row.entry_id,
          accountId: row.account_id,
          accountCode: row.account_code,
          accountLabel: row.account_label,
          debit: row.debit,
          credit: row.credit,
        })
      }
    }

    const entries = Array.from(entryMap.values()).map(normalizeRow)

    return NextResponse.json({ data: entries })
  } catch (error) {
    console.error('Entries GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { journalId, date, reference, label, lines } = await request.json()

    if (!journalId || !date || !lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { error: 'journalId, date, and at least one line are required' },
        { status: 400 }
      )
    }

    const ref = reference || `EC-${Date.now()}`
    const lbl = label || ''
    const entryDate = new Date(date)

    // Insert entry
    const entries = await queryDB(
      `INSERT INTO "Entry" (id, "journalId", date, reference, label, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
       RETURNING *`,
      [journalId, entryDate, ref, lbl]
    )

    const entry = normalizeRow(entries[0])

    // Insert lines
    const insertedLines: any[] = []
    for (const line of lines) {
      const lineRows = await queryDB(
        `INSERT INTO "EntryLine" (id, "entryId", "accountId", "accountCode", "accountLabel", debit, credit)
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          entry.id,
          line.accountId,
          line.accountCode,
          line.accountLabel || '',
          line.debit || 0,
          line.credit || 0,
        ]
      )
      insertedLines.push(normalizeRow(lineRows[0]))
    }

    entry.lines = insertedLines

    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (error) {
    console.error('Entries POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
