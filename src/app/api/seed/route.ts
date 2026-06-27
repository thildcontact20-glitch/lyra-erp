import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS "User" (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, "companyId" TEXT, role TEXT DEFAULT 'USER', "emailVerified" BOOLEAN DEFAULT false, "verifyToken" TEXT, "verifyTokenExp" TIMESTAMP, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "Company" (id TEXT PRIMARY KEY, name TEXT NOT NULL, "rcNumber" TEXT, "ciNumber" TEXT, address TEXT, phone TEXT, email TEXT, "logoUrl" TEXT, "createdAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, code TEXT UNIQUE NOT NULL, description TEXT, "priceMonthly" FLOAT NOT NULL, "priceYearly" FLOAT NOT NULL, "maxUsers" INT NOT NULL, "maxCompanies" INT NOT NULL, features TEXT NOT NULL, "isActive" BOOLEAN DEFAULT TRUE, "createdAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "Subscription" (id TEXT PRIMARY KEY, "companyId" TEXT UNIQUE NOT NULL REFERENCES "Company"(id), "planId" TEXT NOT NULL REFERENCES "SubscriptionPlan"(id), status TEXT DEFAULT 'trial', "startDate" TIMESTAMP DEFAULT NOW(), "endDate" TIMESTAMP, "paymentPeriod" TEXT DEFAULT 'monthly', "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "FiscalYear" (id TEXT PRIMARY KEY, "companyId" TEXT REFERENCES "Company"(id), label TEXT NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "isClosed" BOOLEAN DEFAULT FALSE, "createdAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "ChartAccount" (id TEXT PRIMARY KEY, "companyId" TEXT REFERENCES "Company"(id), code TEXT NOT NULL, label TEXT NOT NULL, type TEXT NOT NULL, "isActive" BOOLEAN DEFAULT TRUE)`,
  `CREATE TABLE IF NOT EXISTS "Journal" (id TEXT PRIMARY KEY, "fiscalYearId" TEXT REFERENCES "FiscalYear"(id), code TEXT NOT NULL, label TEXT NOT NULL, "createdAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "Entry" (id TEXT PRIMARY KEY, "journalId" TEXT REFERENCES "Journal"(id), date TIMESTAMP NOT NULL, reference TEXT NOT NULL, label TEXT NOT NULL, "createdAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "EntryLine" (id TEXT PRIMARY KEY, "entryId" TEXT REFERENCES "Entry"(id), "accountId" TEXT NOT NULL, "accountCode" TEXT NOT NULL, "accountLabel" TEXT NOT NULL, debit FLOAT DEFAULT 0, credit FLOAT DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS "Customer" (id TEXT PRIMARY KEY, "companyId" TEXT REFERENCES "Company"(id), name TEXT NOT NULL, contact TEXT, email TEXT, phone TEXT, address TEXT, "createdAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "Supplier" (id TEXT PRIMARY KEY, "companyId" TEXT REFERENCES "Company"(id), name TEXT NOT NULL, contact TEXT, email TEXT, phone TEXT, address TEXT, "createdAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "Invoice" (id TEXT PRIMARY KEY, "companyId" TEXT, "customerId" TEXT REFERENCES "Customer"(id), number TEXT NOT NULL, date TIMESTAMP NOT NULL, "dueDate" TIMESTAMP NOT NULL, "totalHT" FLOAT DEFAULT 0, "totalTVA" FLOAT DEFAULT 0, "totalTTC" FLOAT DEFAULT 0, status TEXT DEFAULT 'DRAFT', "createdAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "InvoiceLine" (id TEXT PRIMARY KEY, "invoiceId" TEXT REFERENCES "Invoice"(id), "itemId" TEXT, label TEXT NOT NULL, quantity FLOAT NOT NULL, "unitPrice" FLOAT NOT NULL, "tvaRate" FLOAT DEFAULT 18, "totalHT" FLOAT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "Item" (id TEXT PRIMARY KEY, "companyId" TEXT REFERENCES "Company"(id), code TEXT NOT NULL, label TEXT NOT NULL, unit TEXT DEFAULT 'U', price FLOAT NOT NULL, stock FLOAT DEFAULT 0, "warehouseId" TEXT, "createdAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "Warehouse" (id TEXT PRIMARY KEY, "companyId" TEXT REFERENCES "Company"(id), label TEXT NOT NULL, location TEXT, "createdAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "StockMovement" (id TEXT PRIMARY KEY, "warehouseId" TEXT REFERENCES "Warehouse"(id), "itemId" TEXT NOT NULL, type TEXT NOT NULL, quantity FLOAT NOT NULL, date TIMESTAMP DEFAULT NOW(), note TEXT)`,
  `CREATE TABLE IF NOT EXISTS "Employee" (id TEXT PRIMARY KEY, "companyId" TEXT REFERENCES "Company"(id), "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL, email TEXT, phone TEXT, position TEXT, "baseSalary" FLOAT NOT NULL, "hireDate" TIMESTAMP DEFAULT NOW(), "contractType" TEXT DEFAULT 'CDI')`,
  `CREATE TABLE IF NOT EXISTS "Payroll" (id TEXT PRIMARY KEY, "employeeId" TEXT REFERENCES "Employee"(id), period TEXT NOT NULL, "baseSalary" FLOAT NOT NULL, bonuses FLOAT DEFAULT 0, indemnities FLOAT DEFAULT 0, "cnpsEmployee" FLOAT DEFAULT 0, "cnpsEmployer" FLOAT DEFAULT 0, "irTax" FLOAT DEFAULT 0, "netSalary" FLOAT NOT NULL, "grossSalary" FLOAT NOT NULL, status TEXT DEFAULT 'DRAFT', "createdAt" TIMESTAMP DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS "TaxConfig" (id TEXT PRIMARY KEY, "companyId" TEXT REFERENCES "Company"(id), label TEXT NOT NULL, rate FLOAT NOT NULL, type TEXT NOT NULL, "isActive" BOOLEAN DEFAULT TRUE)`,
  `CREATE TABLE IF NOT EXISTS "OhadaArticle" (id TEXT PRIMARY KEY, category TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, source TEXT, keywords TEXT, "createdAt" TIMESTAMP DEFAULT NOW())`,
]

async function exec(sql: string) {
  return prisma.$executeRawUnsafe(sql)
}

export async function POST(request: NextRequest) {
  const results: string[] = []

  try {
    // 1. Créer les tables
    results.push('=== CRÉATION TABLES ===')
    for (const sql of CREATE_TABLES) {
      try {
        await exec(sql)
        results.push(`  OK: ${sql.slice(0, 60)}...`)
      } catch (e: any) {
        results.push(`  SKIP: ${String(e.message).slice(0, 80)}`)
      }
    }

    // 2. Forcer la recréation propre de SubscriptionPlan
    results.push('=== MIGRATION ===')
    try {
      await exec('DROP TABLE IF EXISTS "SubscriptionPlan" CASCADE')
      await exec(`CREATE TABLE "SubscriptionPlan" (
        id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, code TEXT UNIQUE NOT NULL,
        description TEXT, "priceMonthly" FLOAT NOT NULL, "priceYearly" FLOAT NOT NULL,
        "maxUsers" INT NOT NULL, "maxCompanies" INT NOT NULL, features TEXT NOT NULL,
        "isActive" BOOLEAN DEFAULT TRUE, "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )`)
      results.push('  OK: SubscriptionPlan recréée')
    } catch (e: any) {
      results.push(`  SKIP: ${String(e.message).slice(0, 80)}`)
    }

    // 3. Recréer Subscription
    try {
      await exec('DROP TABLE IF EXISTS "Subscription" CASCADE')
      await exec(`CREATE TABLE "Subscription" (
        id TEXT PRIMARY KEY, "companyId" TEXT UNIQUE NOT NULL REFERENCES "Company"(id),
        "planId" TEXT NOT NULL REFERENCES "SubscriptionPlan"(id),
        status TEXT DEFAULT 'trial', "startDate" TIMESTAMP DEFAULT NOW(),
        "endDate" TIMESTAMP, "paymentPeriod" TEXT DEFAULT 'monthly',
        "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW()
      )`)
      results.push('  OK: Subscription table OK')
    } catch (e: any) {
      results.push(`  SKIP: ${String(e.message).slice(0, 80)}`)
    }

    // 4. Seeder les plans via Prisma upsert
    results.push('=== SEED PLANS ===')

    const plansData = [
      { id: 'ps1', name: 'Starter', code: 'starter', description: 'Pour les TPE souhaitant une comptabilité simplifiée', priceMonthly: 19900, priceYearly: 199000, maxUsers: 3, maxCompanies: 1, features: '["compta_base","commercial_base","stocks_base","financial_basic","dashboard","chat_limited"]', isActive: true },
      { id: 'ps2', name: 'Business', code: 'business', description: 'Pour les PME ayant besoin d une gestion complète', priceMonthly: 49900, priceYearly: 499000, maxUsers: 10, maxCompanies: 3, features: '["compta_complete","commercial_full","stocks_advanced","payroll","tax","financial_full","dashboard_premium","chat_full"]', isActive: true },
      { id: 'ps3', name: 'Enterprise', code: 'enterprise', description: 'Enterprise', priceMonthly: 99900, priceYearly: 999000, maxUsers: 30, maxCompanies: 999, features: '["compta_complete","commercial_full","stocks_advanced","payroll","tax","financial_full","dashboard_premium","chat_full","multi_company","workflows","advanced_roles","custom_reports","support_priority","on_premise"]', isActive: true },
    ]

    for (const plan of plansData) {
      try {
        await prisma.subscriptionPlan.upsert({
          where: { id: plan.id },
          create: plan,
          update: plan,
        })
        results.push(`  OK: ${plan.name} (${plan.code})`)
      } catch (e: any) {
        results.push(`  SKIP: ${String(e.message).slice(0, 80)}`)
      }
    }

    // 5. Vérifier
    const planCount = await prisma.subscriptionPlan.count({ where: { isActive: true } })
    results.push(`=== RÉSULTAT: ${planCount} plans actifs dans la DB ===`)

    return NextResponse.json({ 
      success: true, 
      message: `✅ LYRA ERP prêt ! ${planCount} plans actifs`,
      log: results.join('\n')
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, log: results.join('\n') }, { status: 500 })
  }
}
