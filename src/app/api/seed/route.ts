import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json()
    
    // Protection simple
    if (secret !== 'lyra-seed-2026') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const results: string[] = []
    
    // Push Prisma schema
    results.push('=== DB PUSH ===')
    const pushOutput = execSync('npx prisma db push --accept-data-loss 2>&1', { 
      encoding: 'utf-8',
      timeout: 30000,
      env: { ...process.env }
    })
    results.push(pushOutput.slice(0, 500))
    
    // Seed
    results.push('=== DB SEED ===')
    const seedOutput = execSync('npx prisma db seed 2>&1', {
      encoding: 'utf-8',
      timeout: 30000,
      env: { ...process.env }
    })
    results.push(seedOutput.slice(0, 500))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Base de données initialisée avec succès',
      log: results.join('\n')
    })
  } catch (e: any) {
    return NextResponse.json({ 
      error: String(e.message || e),
      log: e.stdout || ''
    }, { status: 500 })
  }
}
