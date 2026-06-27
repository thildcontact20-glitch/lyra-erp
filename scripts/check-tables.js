const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.luhdosoqsqdpgtxkhrgq:LyraSupabase2026!@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify',
});
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
  .then(r => { 
    console.log('Tables in DB:');
    r.rows.forEach(x => console.log(' -', x.table_name));
    pool.end();
  })
  .catch(e => { console.error(e.message); pool.end(); });
