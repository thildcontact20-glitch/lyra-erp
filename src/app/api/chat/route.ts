import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

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
      return NextResponse.json({
        response: "Je suis désolé, l'assistant IA n'est pas encore configuré. Veuillez réessayer plus tard."
      });
    }

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Tu es LYRA, l'assistant IA officiel de LYRA ERP — un ERP ivoirien conforme au SYSCOHADA (OHADA).

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
- Sois utile et direct.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('DeepSeek error:', res.status, errText);
      return NextResponse.json({
        response: "Désolé, l'assistant IA est momentanément indisponible. Veuillez réessayer dans quelques instants."
      });
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      response: answer,
      source: 'LYRA IA (DeepSeek)',
    });

  } catch (error: any) {
    console.error('Chat error:', error?.message || error);
    return NextResponse.json({
      response: "Une erreur technique est survenue. Veuillez réessayer."
    });
  }
}
