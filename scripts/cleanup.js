const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.luhdosoqsqdpgtxkhrgq:LyraSupabase2026!@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify',
});

async function cleanup() {
  console.log('🧹 Nettoyage DB...');
  
  // Ordre inverse des dépendances
  const tables = [
    'EntryLine', 'Entry', 'Journal', 'FiscalYear',
    'Payroll', 'Employee',
    'InvoiceLine', 'Invoice', 'Customer', 'Supplier',
    'StockMovement', 'Item', 'Warehouse',
    'ChartAccount', 'TaxConfig', 'TaxDeclaration',
    'OhadaArticle', 'Subscription', 'SubscriptionPlan', 'User', 'Company'
  ];
  
  for (const t of tables) {
    try {
      await pool.query(`DELETE FROM "${t}"`);
      console.log(`  ✅ ${t} vidé`);
    } catch (e) {
      console.log(`  ⚠️ ${t}: ${e.message.slice(0, 80)}`);
    }
  }
  
  console.log('✅ Nettoyage terminé');
  await pool.end();
}

cleanup().catch(e => { console.error('❌', e.message); process.exit(1); });
