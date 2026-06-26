import { NextRequest, NextResponse } from 'next/server';

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

const SYSTEM_PROMPT = `Tu es LYRA, l'assistant IA officiel de LYRA ERP — un ERP ivoirien conforme au SYSCOHADA (OHADA).

Tu réponds à TOUTES les questions des entrepreneurs et comptables ivoiriens :
- Comptabilité SYSCOHADA (plan comptable, écritures, journaux, balances)
- Fiscalité ivoirienne (TVA 18%, BIC, IRS, impôts, déclarations DGI)
- Paie et CNPS (calcul des cotisations, déclarations mensuelles)
- Droit des sociétés OHADA (SA, SARL, SAS, capital social, RCCM)
- Gestion d'entreprise (facturation, stocks, trésorerie)
- Utilisation de LYRA ERP

Règles :
- Réponds en français ivoirien, clair et pratique.
- Si on te parle de "LYRA", c'est la même chose que "OHADA" ou "SYSCOHADA".
- Donne des exemples concrets avec des chiffres en FCFA.
- Si tu ne sais pas, dis-le honnêtement.
- Sois utile, pas verbeux.`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Assistant IA non configuré' },
        { status: 503 }
      );
    }

    // 1. Chercher des articles OHADA dans la DB pour enrichir le contexte
    let contextArticles: string[] = []
    try {
      const keywords = message.split(' ').filter((w: string) => w.length > 3)
      if (keywords.length > 0) {
        const orConditions = keywords.map((k: string, i: number) => 
          `content ILIKE '%' || $${i+1} || '%' OR keywords ILIKE '%' || $${i+1} || '%' OR title ILIKE '%' || $${i+1} || '%'`
        ).join(' OR ')
        const articles = await queryDB(
          `SELECT title, content FROM "OhadaArticle" WHERE ${orConditions} LIMIT 3`,
          keywords
        )
        contextArticles = articles.map((a: any) => `[${a.title}] ${a.content?.substring(0, 500)}`)
      }
    } catch {
      // DB pas disponible — continuer sans contexte
    }

    // 2. Appeler DeepSeek
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(contextArticles.length > 0 ? [{
        role: 'system',
        content: `Voici des articles de la base documentaire LYRA qui peuvent aider:\n${contextArticles.join('\n\n')}`
      }] : []),
      { role: 'user', content: message }
    ]

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('DeepSeek API error:', res.status, errText)
      return NextResponse.json(
        { response: "Désolé, l'assistant IA est momentanément indisponible. Réessayez dans quelques instants." },
        { status: 200 }
      )
    }

    const data = await res.json()
    const answer = data.choices?.[0]?.message?.content || ''

    return NextResponse.json({
      response: answer,
      source: 'LYRA IA',
    })

  } catch (error) {
    console.error('Chat POST error:', error)
    return NextResponse.json(
      { response: "Une erreur technique est survenue. Veuillez réessayer." },
      { status: 200 }
    )
  }
}
