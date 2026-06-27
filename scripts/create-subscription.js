const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.luhdosoqsqdpgtxkhrgq:LyraSupabase2026!@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify',
});
pool.query(`
  CREATE TABLE IF NOT EXISTS "Subscription" (
    id TEXT PRIMARY KEY,
    "companyId" TEXT UNIQUE NOT NULL REFERENCES "Company"(id),
    "planId" TEXT NOT NULL REFERENCES "SubscriptionPlan"(id),
    status TEXT DEFAULT 'active',
    "paymentPeriod" TEXT DEFAULT 'monthly',
    "startDate" TIMESTAMP NOT NULL DEFAULT NOW(),
    "endDate" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  );
`).then(r => { 
  console.log('✅ Subscription table created');
  pool.end();
}).catch(e => { console.error(e.message); pool.end(); });
