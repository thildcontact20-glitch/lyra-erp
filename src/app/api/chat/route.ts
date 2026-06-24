import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Search for relevant OHADA articles that contain the message text
    const articles = await prisma.ohadaArticle.findMany({
      where: {
        content: {
          contains: message,
        },
      },
      take: 5,
    });

    let response: string;
    const resultArticles: typeof articles = [...articles];

    if (articles.length > 0) {
      response = `J'ai trouvé ${articles.length} article(s) OHADA en lien avec votre question.`;
    } else {
      // If no direct match, search more broadly by keywords
      const keywords = message.split(' ').filter((w: string) => w.length > 3);
      if (keywords.length > 0) {
        const broadArticles = await prisma.ohadaArticle.findMany({
          where: {
            OR: keywords.map((keyword: string) => ({
              OR: [
                { content: { contains: keyword } },
                { keywords: { contains: keyword } },
                { title: { contains: keyword } },
              ],
            })),
          },
          take: 3,
        });

        if (broadArticles.length > 0) {
          response = 'Je n\'ai pas trouvé de correspondance exacte, mais voici quelques articles OHADA pouvant être liés à votre question.';
          resultArticles.push(...broadArticles);
        } else {
          response = "Je n'ai pas trouvé d'article OHADA correspondant directement à votre question. Veuillez reformuler ou consulter la documentation OHADA.";
        }
      } else {
        response = "Je n'ai pas trouvé d'article OHADA correspondant. Veuillez fournir plus de détails.";
      }
    }

    const references = resultArticles.map((article) => ({
      title: article.title,
      source: article.source || 'OHADA',
    }));

    return NextResponse.json({
      response,
      references,
    });
  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
