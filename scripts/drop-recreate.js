const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.luhdosoqsqdpgtxkhrgq:LyraSupabase2026!@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify',
});

async function main() {
  console.log('🔄 Synchronisation DB...');
  
  // 1. Vérifier connexion
  const test = await pool.query('SELECT 1 as ok');
  console.log('✅ Connexion OK:', test.rows[0].ok);

  // 2. Supprimer les tables existantes (ordre inverse des dépendances)
  console.log('🗑️  Suppression des tables existantes...');
  const dropTables = [
    'StockMovement', 'Payroll', 'Employee', 'InvoiceLine', 'Invoice',
    'Supplier', 'Customer', 'EntryLine', 'Entry', 'Journal',
    'ChartAccount', 'FiscalYear', 'Subscription', 'SubscriptionPlan',
    'TaxDeclaration', 'TaxConfig', 'Item', 'Warehouse', 'OhadaArticle',
    'User', 'Company'
  ];
  for (const t of dropTables) {
    try {
      await pool.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);
    } catch (e) {
      // ignore
    }
  }
  console.log('✅ Tables supprimées');
  
  // 3. Recréer les tables avec le schéma Prisma exact
  console.log('🏗️  Création des tables...');
  
  // Company - uses rcNumber, ciNumber (Prisma schema)
  await pool.query(`
    CREATE TABLE "Company" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      "rcNumber" TEXT,
      "ciNumber" TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      "logoUrl" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Company');

  // User
  await pool.query(`
    CREATE TABLE "User" (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      "companyId" TEXT REFERENCES "Company"(id),
      role TEXT DEFAULT 'USER',
      "emailVerified" BOOLEAN DEFAULT false,
      "verifyToken" TEXT,
      "verifyTokenExp" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ User');

  // SubscriptionPlan
  await pool.query(`
    CREATE TABLE "SubscriptionPlan" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      "priceMonthly" DOUBLE PRECISION NOT NULL,
      "priceYearly" DOUBLE PRECISION NOT NULL,
      "maxUsers" INTEGER NOT NULL,
      "maxCompanies" INTEGER NOT NULL,
      features TEXT NOT NULL,
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ SubscriptionPlan');

  // FiscalYear
  await pool.query(`
    CREATE TABLE "FiscalYear" (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL REFERENCES "Company"(id),
      label TEXT NOT NULL,
      "startDate" TIMESTAMP NOT NULL,
      "endDate" TIMESTAMP NOT NULL,
      "isClosed" BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ FiscalYear');

  // ChartAccount
  await pool.query(`
    CREATE TABLE "ChartAccount" (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL REFERENCES "Company"(id),
      code TEXT NOT NULL,
      label TEXT NOT NULL,
      type TEXT NOT NULL,
      "isActive" BOOLEAN DEFAULT true
    );
  `);
  console.log('  ✅ ChartAccount');

  // Journal
  await pool.query(`
    CREATE TABLE "Journal" (
      id TEXT PRIMARY KEY,
      "fiscalYearId" TEXT NOT NULL REFERENCES "FiscalYear"(id),
      code TEXT NOT NULL,
      label TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Journal');

  // Entry
  await pool.query(`
    CREATE TABLE "Entry" (
      id TEXT PRIMARY KEY,
      "journalId" TEXT NOT NULL REFERENCES "Journal"(id),
      date TIMESTAMP NOT NULL,
      reference TEXT NOT NULL,
      label TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Entry');

  // EntryLine
  await pool.query(`
    CREATE TABLE "EntryLine" (
      id TEXT PRIMARY KEY,
      "entryId" TEXT NOT NULL REFERENCES "Entry"(id),
      "accountId" TEXT NOT NULL,
      "accountCode" TEXT NOT NULL,
      "accountLabel" TEXT NOT NULL,
      debit DOUBLE PRECISION DEFAULT 0,
      credit DOUBLE PRECISION DEFAULT 0
    );
  `);
  console.log('  ✅ EntryLine');

  // Customer
  await pool.query(`
    CREATE TABLE "Customer" (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL REFERENCES "Company"(id),
      name TEXT NOT NULL,
      contact TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Customer');

  // Supplier
  await pool.query(`
    CREATE TABLE "Supplier" (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL REFERENCES "Company"(id),
      name TEXT NOT NULL,
      contact TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Supplier');

  // Invoice
  await pool.query(`
    CREATE TABLE "Invoice" (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL REFERENCES "Company"(id),
      "customerId" TEXT NOT NULL REFERENCES "Customer"(id),
      number TEXT NOT NULL,
      date TIMESTAMP NOT NULL,
      "dueDate" TIMESTAMP NOT NULL,
      "totalHT" DOUBLE PRECISION NOT NULL,
      "totalTVA" DOUBLE PRECISION NOT NULL,
      "totalTTC" DOUBLE PRECISION NOT NULL,
      status TEXT DEFAULT 'DRAFT',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Invoice');

  // InvoiceLine
  await pool.query(`
    CREATE TABLE "InvoiceLine" (
      id TEXT PRIMARY KEY,
      "invoiceId" TEXT NOT NULL REFERENCES "Invoice"(id),
      "itemId" TEXT,
      label TEXT NOT NULL,
      quantity DOUBLE PRECISION NOT NULL,
      "unitPrice" DOUBLE PRECISION NOT NULL,
      "tvaRate" DOUBLE PRECISION DEFAULT 18,
      "totalHT" DOUBLE PRECISION NOT NULL
    );
  `);
  console.log('  ✅ InvoiceLine');

  // Item
  await pool.query(`
    CREATE TABLE "Item" (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL REFERENCES "Company"(id),
      code TEXT NOT NULL,
      label TEXT NOT NULL,
      unit TEXT DEFAULT 'U',
      price DOUBLE PRECISION NOT NULL,
      stock DOUBLE PRECISION DEFAULT 0,
      "warehouseId" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Item');

  // Warehouse
  await pool.query(`
    CREATE TABLE "Warehouse" (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL REFERENCES "Company"(id),
      label TEXT NOT NULL,
      location TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Warehouse');

  // StockMovement
  await pool.query(`
    CREATE TABLE "StockMovement" (
      id TEXT PRIMARY KEY,
      "warehouseId" TEXT NOT NULL REFERENCES "Warehouse"(id),
      "itemId" TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity DOUBLE PRECISION NOT NULL,
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      note TEXT
    );
  `);
  console.log('  ✅ StockMovement');

  // Employee
  await pool.query(`
    CREATE TABLE "Employee" (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL REFERENCES "Company"(id),
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      position TEXT,
      "baseSalary" DOUBLE PRECISION NOT NULL,
      "hireDate" TIMESTAMP NOT NULL DEFAULT NOW(),
      "contractType" TEXT DEFAULT 'CDI'
    );
  `);
  console.log('  ✅ Employee');

  // Payroll
  await pool.query(`
    CREATE TABLE "Payroll" (
      id TEXT PRIMARY KEY,
      "employeeId" TEXT NOT NULL REFERENCES "Employee"(id),
      period TEXT NOT NULL,
      "baseSalary" DOUBLE PRECISION NOT NULL,
      bonuses DOUBLE PRECISION DEFAULT 0,
      indemnities DOUBLE PRECISION DEFAULT 0,
      "cnpsEmployee" DOUBLE PRECISION DEFAULT 0,
      "cnpsEmployer" DOUBLE PRECISION DEFAULT 0,
      "irTax" DOUBLE PRECISION DEFAULT 0,
      "netSalary" DOUBLE PRECISION NOT NULL,
      "grossSalary" DOUBLE PRECISION NOT NULL,
      status TEXT DEFAULT 'DRAFT',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Payroll');

  // TaxConfig
  await pool.query(`
    CREATE TABLE "TaxConfig" (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL REFERENCES "Company"(id),
      label TEXT NOT NULL,
      rate DOUBLE PRECISION NOT NULL,
      type TEXT NOT NULL,
      "isActive" BOOLEAN DEFAULT true
    );
  `);
  console.log('  ✅ TaxConfig');

  // TaxDeclaration
  await pool.query(`
    CREATE TABLE "TaxDeclaration" (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL,
      period TEXT NOT NULL,
      "totalCollected" DOUBLE PRECISION DEFAULT 0,
      "totalDeductible" DOUBLE PRECISION DEFAULT 0,
      "netDue" DOUBLE PRECISION DEFAULT 0,
      status TEXT DEFAULT 'DRAFT',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ TaxDeclaration');

  // OhadaArticle
  await pool.query(`
    CREATE TABLE "OhadaArticle" (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT,
      keywords TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ OhadaArticle');

  console.log('✅ Toutes les tables créées avec succès !');
  await pool.end();
}

main().catch(e => {
  console.error('❌ Erreur:', e.message);
  process.exit(1);
});
