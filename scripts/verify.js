const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.luhdosoqsqdpgtxkhrgq:LyraSupabase2026!@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify',
});

async function verify() {
  const checks = [
    { label: 'Plans abonnement', sql: 'SELECT COUNT(*) FROM "SubscriptionPlan"' },
    { label: 'Users', sql: 'SELECT COUNT(*) FROM "User"' },
    { label: 'Companies', sql: 'SELECT COUNT(*) FROM "Company"' },
    { label: 'Comptes SYSCOHADA', sql: 'SELECT COUNT(*) FROM "ChartAccount"' },
    { label: 'Journaux', sql: 'SELECT COUNT(*) FROM "Journal"' },
    { label: 'Écritures', sql: 'SELECT COUNT(*) FROM "Entry"' },
    { label: 'Clients', sql: 'SELECT COUNT(*) FROM "Customer"' },
    { label: 'Fournisseurs', sql: 'SELECT COUNT(*) FROM "Supplier"' },
    { label: 'Factures', sql: 'SELECT COUNT(*) FROM "Invoice"' },
    { label: 'Articles', sql: 'SELECT COUNT(*) FROM "Item"' },
    { label: 'Employés', sql: 'SELECT COUNT(*) FROM "Employee"' },
    { label: 'Bulletins paie', sql: 'SELECT COUNT(*) FROM "Payroll"' },
    { label: 'Déclarations TVA', sql: 'SELECT COUNT(*) FROM "TaxDeclaration"' },
    { label: 'Articles OHADA', sql: 'SELECT COUNT(*) FROM "OhadaArticle"' },
    { label: 'Abonnement', sql: 'SELECT COUNT(*) FROM "Subscription"' },
  ];
  
  console.log('📊 VÉRIFICATION DB :');
  console.log('');
  for (const c of checks) {
    const r = await pool.query(c.sql);
    const count = parseInt(r.rows[0].count);
    const status = count > 0 ? '✅' : '❌';
    console.log(`  ${status} ${c.label.padEnd(25)} : ${count}`);
  }
  
  console.log('');
  console.log('🔍 Vérification admin...');
  const admin = await pool.query('SELECT email, role, name FROM "User" WHERE email=$1', ['admin@lyra.ci']);
  console.log(`  Admin: ${admin.rows[0].name} / ${admin.rows[0].email} / role=${admin.rows[0].role}`);
  
  await pool.end();
}

verify().catch(e => { console.error('❌', e.message); process.exit(1); });
