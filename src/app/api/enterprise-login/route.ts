import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026'

async function queryDB(sql: string, params?: any[]) {
  const { Pool } = require('pg')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const result = await pool.query(sql, params)
    return result.rows
  } finally {
    await pool.end()
  }
}

export async function GET() {
  try {
    const hash = bcrypt.hashSync('lyra2026', 10)

    // Supprimer puis créer le user CEO
    await queryDB('DELETE FROM "User" WHERE email = $1', ['ceo@vivalys.ci'])
    await queryDB(
      `INSERT INTO "User" (id, email, password, name, role, "companyId", "emailVerified", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())`,
      ['ua-ceo', 'ceo@vivalys.ci', hash, 'CEO Vivalys', 'ADMIN', null, true]
    )

    const token = jwt.sign(
      { userId: 'ua-ceo', email: 'ceo@vivalys.ci', companyId: null },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    // Page HTML : set localStorage + cookie client + setTimeout avant redirection
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Connexion LYRA</title></head>
<body style="background:#0a0f0a;color:#d4af37;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:16px">
  <p>🔐 Connexion établie...</p>
  <p style="color:rgba(255,255,255,0.4);font-size:14px">Redirection vers votre espace</p>
  <script>
    (function() {
      var t = '${token}';
      // 1. Cookie non-HttpOnly
      document.cookie = 'token=' + t + '; path=/; max-age=2592000';
      // 2. localStorage
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify({id:'ua-ceo',email:'ceo@vivalys.ci',name:'CEO Vivalys',role:'ADMIN'}));
      // 3. Attendre 500ms pour être sûr que tout est écrit
      setTimeout(function() {
        window.location.href = '/dashboard?plan=enterprise';
      }, 500);
    })();
  </script>
</body></html>`

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
      },
    })
  } catch (error) {
    return new Response(`Erreur: ${(error as Error).message}`, { status: 500 })
  }
}
