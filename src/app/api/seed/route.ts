import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { Client } = require('pg')
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
    await client.connect()
    
    // Push Prisma schema via SQL brut
    const tables = [
      `CREATE TABLE IF NOT EXISTS "User" (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, "companyId" TEXT, role TEXT DEFAULT 'USER', "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`,
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
    
    for (const sql of tables) {
      try { await client.query(sql) } catch (e: any) { /* table existe deja */ }
    }
    
    // Seed
    await client.query(`INSERT INTO "SubscriptionPlan" VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) ON CONFLICT DO NOTHING`, 
      ['ps1','Starter','starter','Pour TPE',19900,199000,3,1,'["compta_base","commercial_base","stocks_base","financial_basic","dashboard","chat_limited"]',true])
    await client.query(`INSERT INTO "SubscriptionPlan" VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) ON CONFLICT DO NOTHING`,
      ['ps2','Business','business','Pour PME',49900,499000,10,3,'["compta_complete","commercial_full","stocks_advanced","payroll","tax","financial_full","dashboard_premium","chat_full"]',true])
    await client.query(`INSERT INTO "SubscriptionPlan" VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) ON CONFLICT DO NOTHING`,
      ['ps3','Enterprise','enterprise','Pour groupes',99900,999000,30,999,'["compta_complete","commercial_full","stocks_advanced","payroll","tax","financial_full","dashboard_premium","chat_full","multi_company","workflows","advanced_roles","custom_reports","support_priority","on_premise"]',true])
    await client.query(`INSERT INTO "User" VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) ON CONFLICT DO NOTHING`,
      ['ua1','admin@lyra.ci','$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmEGYXHjlM5VBiJMjy2u','Admin LYRA','cd1','ADMIN'])
    await client.query(`INSERT INTO "Company" VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) ON CONFLICT DO NOTHING`,
      ['cd1','LYRA CI','CI-ABJ-2024-12345','123456789P','Abidjan Plateau','+2250102030405','contact@lyra.ci',null])
    await client.query(`INSERT INTO "Subscription" VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) ON CONFLICT DO NOTHING`,
      ['sd1','cd1','ps2','active',new Date().toISOString(),new Date(Date.now()+30*86400000).toISOString(),'monthly'])
    
    await client.end()
    return NextResponse.json({ success: true, message: 'DB seedee avec succes! Login: admin@lyra.ci / admin123' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
