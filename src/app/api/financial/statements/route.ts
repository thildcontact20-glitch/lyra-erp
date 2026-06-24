import prisma from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'balance';

    switch (type) {
      case 'income': {
        // Compte de résultat: group entry lines by ChartAccount type
        const accounts = await prisma.chartAccount.findMany({
          where: { type: { in: ['REVENUE', 'EXPENSE'] } },
        });

        const accountCodes = accounts.map((a) => a.code);

        const lines = await prisma.entryLine.findMany({
          where: {
            accountCode: { in: accountCodes },
          },
        });

        let totalRevenue = 0;
        let totalExpenses = 0;

        const accountMap = new Map(accounts.map((a) => [a.code, a.type]));

        for (const line of lines) {
          const accType = accountMap.get(line.accountCode);
          if (accType === 'REVENUE') {
            totalRevenue += line.credit;
          } else if (accType === 'EXPENSE') {
            totalExpenses += line.debit;
          }
        }

        return NextResponse.json({
          data: {
            type: 'income_statement',
            totalRevenue,
            totalExpenses,
            netIncome: totalRevenue - totalExpenses,
          },
        });
      }

      case 'tafire': {
        // TAFIRE simplifié: CA (70), Achats (60), Services (61), Personnel (64), Impôts (63)
        const caLines = await prisma.entryLine.findMany({
          where: { accountCode: { startsWith: '70' } },
        });
        const purchaseLines = await prisma.entryLine.findMany({
          where: { accountCode: { startsWith: '60' } },
        });
        const serviceLines = await prisma.entryLine.findMany({
          where: { accountCode: { startsWith: '61' } },
        });
        const personnelLines = await prisma.entryLine.findMany({
          where: { accountCode: { startsWith: '64' } },
        });
        const taxLines = await prisma.entryLine.findMany({
          where: { accountCode: { startsWith: '63' } },
        });

        const ca = caLines.reduce((s, l) => s + l.credit, 0);
        const achats = purchaseLines.reduce((s, l) => s + l.debit, 0);
        const services = serviceLines.reduce((s, l) => s + l.debit, 0);
        const fraisPersonnel = personnelLines.reduce((s, l) => s + l.debit, 0);
        const impotsTaxes = taxLines.reduce((s, l) => s + l.debit, 0);

        const va = ca - achats - services;
        const ebe = va - fraisPersonnel - impotsTaxes;

        return NextResponse.json({
          data: {
            type: 'tafire',
            ca,
            achats,
            servicesExternes: services,
            valeurAjoutee: va,
            fraisPersonnel,
            impotsTaxes,
            ebe,
          },
        });
      }

      case 'balance':
      default: {
        // BILAN: group by ASSET, LIABILITY, EQUITY
        const accounts = await prisma.chartAccount.findMany({
          where: { type: { in: ['ASSET', 'LIABILITY', 'EQUITY'] } },
        });

        const accountCodes = accounts.map((a) => a.code);

        const lines = await prisma.entryLine.findMany({
          where: {
            accountCode: { in: accountCodes },
          },
        });

        const accountMap = new Map(accounts.map((a) => [a.code, a.type]));
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;

        for (const line of lines) {
          const accType = accountMap.get(line.accountCode);
          if (accType === 'ASSET') {
            totalAssets += line.debit - line.credit;
          } else if (accType === 'LIABILITY') {
            totalLiabilities += line.credit - line.debit;
          } else if (accType === 'EQUITY') {
            totalEquity += line.credit - line.debit;
          }
        }

        return NextResponse.json({
          data: {
            type: 'balance_sheet',
            totalAssets,
            totalLiabilities,
            totalEquity,
            totalPassif: totalLiabilities + totalEquity,
          },
        });
      }
    }
  } catch (error) {
    console.error('Financial statements GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
