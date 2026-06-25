import { NextRequest, NextResponse } from 'next/server'

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

interface InsertResult {
  table: string
  id: string
  status: 'OK' | 'SKIP'
  detail?: string
}

export async function POST(request: NextRequest) {
  const results: InsertResult[] = []

  try {
    // ── Auth: JWT + rôle ADMIN ──────────────────────────────
    const token =
      request.cookies.get('token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const jwt = require('jsonwebtoken')
    const decoded: any = jwt.verify(token, JWT_SECRET)

    const users = await queryDB(
      'SELECT id, email, role FROM "User" WHERE id = $1',
      [decoded.userId]
    )
    if (!users || users.length === 0 || users[0].role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      )
    }

    // ── 1. Company ───────────────────────────────────────────
    let companyId = 'demo-c1'
    try {
      await queryDB(
        `INSERT INTO "Company" (id, name, "rcNumber", "ciNumber", address, phone, email)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          companyId,
          'DÉMO LYRA CI',
          'RC-2025-00123',
          'CI-2025-A-00456',
          'Abidjan, Plateau, Avenue Terrasson de Fougères',
          '+225 27 22 33 44 55',
          'demo@lyra.ci',
        ]
      )
      results.push({ table: 'Company', id: companyId, status: 'OK' })
    } catch (e: any) {
      results.push({
        table: 'Company',
        id: companyId,
        status: 'SKIP',
        detail: e.message?.slice(0, 120),
      })
    }

    // ── 2. Clients ───────────────────────────────────────────
    const clients = [
      {
        id: 'demo-client1',
        name: 'BIOCOOP AFRIQUE',
        contact: 'M. Koné Ibrahim',
        email: 'contact@biocoop.ci',
        phone: '+225 01 02 03 04 05',
        address: 'Cocody, Rue des Jardins',
      },
      {
        id: 'demo-client2',
        name: 'SODECI',
        contact: 'Mme Diallo Aïcha',
        email: 'facturation@sodeci.ci',
        phone: '+225 05 06 07 08 09',
        address: 'Treichville, Zone industrielle',
      },
      {
        id: 'demo-client3',
        name: 'ORANGE CI',
        contact: 'M. Traoré Moussa',
        email: 'compta@orange.ci',
        phone: '+225 07 08 09 10 11',
        address: 'Abidjan, Marcory',
      },
    ]

    for (const c of clients) {
      try {
        await queryDB(
          `INSERT INTO "Customer" (id, "companyId", name, contact, email, phone, address)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [c.id, companyId, c.name, c.contact, c.email, c.phone, c.address]
        )
        results.push({ table: 'Customer', id: c.id, status: 'OK' })
      } catch (e: any) {
        results.push({
          table: 'Customer',
          id: c.id,
          status: 'SKIP',
          detail: e.message?.slice(0, 120),
        })
      }
    }

    // ── 3. Fournisseurs ──────────────────────────────────────
    const suppliers = [
      {
        id: 'demo-supp1',
        name: 'DISTRIPLUS CI',
        contact: 'M. Bamba Souleymane',
        email: 'commandes@distriplus.ci',
        phone: '+225 20 21 22 23 24',
        address: 'Yopougon, Zone Industrielle',
      },
      {
        id: 'demo-supp2',
        name: 'AFRILOGISTICS',
        contact: 'Mme Kouamé Patricia',
        email: 'logistic@afrilogistics.ci',
        phone: '+225 22 23 24 25 26',
        address: 'Port Bouët, Rue des Entrepôts',
      },
    ]

    for (const s of suppliers) {
      try {
        await queryDB(
          `INSERT INTO "Supplier" (id, "companyId", name, contact, email, phone, address)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [s.id, companyId, s.name, s.contact, s.email, s.phone, s.address]
        )
        results.push({ table: 'Supplier', id: s.id, status: 'OK' })
      } catch (e: any) {
        results.push({
          table: 'Supplier',
          id: s.id,
          status: 'SKIP',
          detail: e.message?.slice(0, 120),
        })
      }
    }

    // ── 4. Entrepôt ──────────────────────────────────────────
    const warehouseId = 'demo-wh1'
    try {
      await queryDB(
        `INSERT INTO "Warehouse" (id, "companyId", label, location)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [warehouseId, companyId, 'Entrepôt Principal', 'Abidjan, Zone Industrielle de Yopougon']
      )
      results.push({ table: 'Warehouse', id: warehouseId, status: 'OK' })
    } catch (e: any) {
      results.push({
        table: 'Warehouse',
        id: warehouseId,
        status: 'SKIP',
        detail: e.message?.slice(0, 120),
      })
    }

    // ── 5. Articles ──────────────────────────────────────────
    const items = [
      {
        id: 'demo-item1',
        code: 'ART-BUR-001',
        label: 'Kit fournitures de bureau',
        unit: 'U',
        price: 25000,
        stock: 50,
      },
      {
        id: 'demo-item2',
        code: 'SVC-CON-001',
        label: 'Consulting comptable (jour)',
        unit: 'J',
        price: 150000,
        stock: 999,
      },
      {
        id: 'demo-item3',
        code: 'SVC-FOR-001',
        label: 'Formation OHADA (session)',
        unit: 'S',
        price: 350000,
        stock: 20,
      },
    ]

    for (const item of items) {
      try {
        await queryDB(
          `INSERT INTO "Item" (id, "companyId", code, label, unit, price, stock, "warehouseId")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [
            item.id,
            companyId,
            item.code,
            item.label,
            item.unit,
            item.price,
            item.stock,
            warehouseId,
          ]
        )
        results.push({ table: 'Item', id: item.id, status: 'OK' })
      } catch (e: any) {
        results.push({
          table: 'Item',
          id: item.id,
          status: 'SKIP',
          detail: e.message?.slice(0, 120),
        })
      }
    }

    // ── 6. Employés ──────────────────────────────────────────
    const employees = [
      {
        id: 'demo-emp1',
        firstName: 'Kouame',
        lastName: 'Jean',
        email: 'kj@demo.lyra.ci',
        phone: '+225 01 12 13 14 15',
        position: 'Comptable',
        baseSalary: 800000,
        contractType: 'CDI',
      },
      {
        id: 'demo-emp2',
        firstName: 'Diallo',
        lastName: 'Fatou',
        email: 'df@demo.lyra.ci',
        phone: '+225 05 15 16 17 18',
        position: 'Directrice Financière',
        baseSalary: 1200000,
        contractType: 'CDI',
      },
    ]

    for (const emp of employees) {
      try {
        await queryDB(
          `INSERT INTO "Employee" (id, "companyId", "firstName", "lastName", email, phone, position, "baseSalary", "contractType")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [
            emp.id,
            companyId,
            emp.firstName,
            emp.lastName,
            emp.email,
            emp.phone,
            emp.position,
            emp.baseSalary,
            emp.contractType,
          ]
        )
        results.push({ table: 'Employee', id: emp.id, status: 'OK' })
      } catch (e: any) {
        results.push({
          table: 'Employee',
          id: emp.id,
          status: 'SKIP',
          detail: e.message?.slice(0, 120),
        })
      }
    }

    // ── 7. Bulletins de paie ─────────────────────────────────
    const now = new Date()
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const payrolls = [
      {
        id: 'demo-pay1',
        employeeId: 'demo-emp1',
        baseSalary: 800000,
        bonuses: 50000,
        indemnities: 25000,
      },
      {
        id: 'demo-pay2',
        employeeId: 'demo-emp2',
        baseSalary: 1200000,
        bonuses: 100000,
        indemnities: 50000,
      },
    ]

    for (const p of payrolls) {
      const gross = p.baseSalary + p.bonuses + p.indemnities
      // CNPS employé: ~6.3% du brut, CNPS employeur: ~11.7% du brut (simplifié)
      const cnpsEmployee = Math.round(gross * 0.063)
      const cnpsEmployer = Math.round(gross * 0.117)
      // IR simplifié: ~3% du brut imposable (simplifié pour demo)
      const irTax = Math.round((gross - 100000) * 0.03)
      const net = gross - cnpsEmployee - irTax

      try {
        await queryDB(
          `INSERT INTO "Payroll" (id, "employeeId", period, "baseSalary", bonuses, indemnities, 
            "cnpsEmployee", "cnpsEmployer", "irTax", "netSalary", "grossSalary", status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
          [
            p.id,
            p.employeeId,
            currentPeriod,
            p.baseSalary,
            p.bonuses,
            p.indemnities,
            cnpsEmployee,
            cnpsEmployer,
            irTax,
            net,
            gross,
            'VALIDATED',
          ]
        )
        results.push({ table: 'Payroll', id: p.id, status: 'OK' })
      } catch (e: any) {
        results.push({
          table: 'Payroll',
          id: p.id,
          status: 'SKIP',
          detail: e.message?.slice(0, 120),
        })
      }
    }

    // ── 8. Exercice fiscal / Journal / Écritures comptables ──
    const fiscalYearId = 'demo-fy1'
    const journalId = 'demo-j1'

    // Créer l'exercice fiscal
    try {
      await queryDB(
        `INSERT INTO "FiscalYear" (id, "companyId", label, "startDate", "endDate", "isClosed")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          fiscalYearId,
          companyId,
          'Exercice 2025',
          '2025-01-01',
          '2025-12-31',
          false,
        ]
      )
      results.push({ table: 'FiscalYear', id: fiscalYearId, status: 'OK' })
    } catch (e: any) {
      results.push({
        table: 'FiscalYear',
        id: fiscalYearId,
        status: 'SKIP',
        detail: e.message?.slice(0, 120),
      })
    }

    // Créer le journal
    try {
      await queryDB(
        `INSERT INTO "Journal" (id, "fiscalYearId", code, label)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [journalId, fiscalYearId, 'VT', 'Journal des Ventes']
      )
      results.push({ table: 'Journal', id: journalId, status: 'OK' })
    } catch (e: any) {
      results.push({
        table: 'Journal',
        id: journalId,
        status: 'SKIP',
        detail: e.message?.slice(0, 120),
      })
    }

    // Plans comptables (comptes de base)
    const accounts = [
      { id: 'demo-acct-4111', code: '4111', label: 'Clients', type: 'ACTIF' },
      {
        id: 'demo-acct-4011',
        code: '4011',
        label: 'Fournisseurs',
        type: 'PASSIF',
      },
      {
        id: 'demo-acct-7011',
        code: '7011',
        label: 'Ventes de marchandises',
        type: 'PRODUIT',
      },
      {
        id: 'demo-acct-6011',
        code: '6011',
        label: 'Achats de marchandises',
        type: 'CHARGE',
      },
      {
        id: 'demo-acct-5112',
        code: '5112',
        label: 'Banque',
        type: 'ACTIF',
      },
      {
        id: 'demo-acct-6311',
        code: '6311',
        label: 'Salaires bruts',
        type: 'CHARGE',
      },
      {
        id: 'demo-acct-6411',
        code: '6411',
        label: 'Charges sociales',
        type: 'CHARGE',
      },
      {
        id: 'demo-acct-4451',
        code: '4451',
        label: 'TVA collectée',
        type: 'PASSIF',
      },
    ]

    for (const a of accounts) {
      try {
        await queryDB(
          `INSERT INTO "ChartAccount" (id, "companyId", code, label, type)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, companyId, a.code, a.label, a.type]
        )
        results.push({ table: 'ChartAccount', id: a.id, status: 'OK' })
      } catch (e: any) {
        results.push({
          table: 'ChartAccount',
          id: a.id,
          status: 'SKIP',
          detail: e.message?.slice(0, 120),
        })
      }
    }

    // Écritures comptables (3 écritures avec lignes)
    const entries = [
      {
        id: 'demo-entry1',
        reference: 'VT-2025-001',
        label: 'Vente à BIOCOOP AFRIQUE',
        date: '2025-06-15',
        lines: [
          {
            accountId: 'demo-acct-4111',
            accountCode: '4111',
            accountLabel: 'Clients',
            debit: 590000,
            credit: 0,
          },
          {
            accountId: 'demo-acct-7011',
            accountCode: '7011',
            accountLabel: 'Ventes de marchandises',
            debit: 0,
            credit: 500000,
          },
          {
            accountId: 'demo-acct-4451',
            accountCode: '4451',
            accountLabel: 'TVA collectée',
            debit: 0,
            credit: 90000,
          },
        ],
      },
      {
        id: 'demo-entry2',
        reference: 'VT-2025-002',
        label: 'Vente de consulting à ORANGE CI',
        date: '2025-06-20',
        lines: [
          {
            accountId: 'demo-acct-4111',
            accountCode: '4111',
            accountLabel: 'Clients',
            debit: 177000,
            credit: 0,
          },
          {
            accountId: 'demo-acct-7011',
            accountCode: '7011',
            accountLabel: 'Ventes de marchandises',
            debit: 0,
            credit: 150000,
          },
          {
            accountId: 'demo-acct-4451',
            accountCode: '4451',
            accountLabel: 'TVA collectée',
            debit: 0,
            credit: 27000,
          },
        ],
      },
      {
        id: 'demo-entry3',
        reference: 'VT-2025-003',
        label: 'Paie du mois (Kouame Jean + Diallo Fatou)',
        date: '2025-06-30',
        lines: [
          {
            accountId: 'demo-acct-6311',
            accountCode: '6311',
            accountLabel: 'Salaires bruts',
            debit: 2100000,
            credit: 0,
          },
          {
            accountId: 'demo-acct-6411',
            accountCode: '6411',
            accountLabel: 'Charges sociales',
            debit: 258300,
            credit: 0,
          },
          {
            accountId: 'demo-acct-5112',
            accountCode: '5112',
            accountLabel: 'Banque',
            debit: 0,
            credit: 1878870,
          },
          {
            accountId: 'demo-acct-4011',
            accountCode: '4011',
            accountLabel: 'Fournisseurs (CNPS)',
            debit: 0,
            credit: 281430,
          },
        ],
      },
    ]

    for (const entry of entries) {
      try {
        await queryDB(
          `INSERT INTO "Entry" (id, "journalId", date, reference, label)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [entry.id, journalId, entry.date, entry.reference, entry.label]
        )
        results.push({ table: 'Entry', id: entry.id, status: 'OK' })

        // Insérer les lignes
        for (const line of entry.lines) {
          const lineId = `${entry.id}-line-${line.accountCode}`
          await queryDB(
            `INSERT INTO "EntryLine" (id, "entryId", "accountId", "accountCode", "accountLabel", debit, credit)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO NOTHING`,
            [
              lineId,
              entry.id,
              line.accountId,
              line.accountCode,
              line.accountLabel,
              line.debit,
              line.credit,
            ]
          )
        }
      } catch (e: any) {
        results.push({
          table: 'Entry',
          id: entry.id,
          status: 'SKIP',
          detail: e.message?.slice(0, 120),
        })
      }
    }

    // ── 9. Configuration fiscale ─────────────────────────────
    try {
      await queryDB(
        `INSERT INTO "TaxConfig" (id, "companyId", label, rate, type, "isActive")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        ['demo-tax1', companyId, 'TVA 18%', 18, 'TVA', true]
      )
      results.push({ table: 'TaxConfig', id: 'demo-tax1', status: 'OK' })
    } catch (e: any) {
      results.push({
        table: 'TaxConfig',
        id: 'demo-tax1',
        status: 'SKIP',
        detail: e.message?.slice(0, 120),
      })
    }

    try {
      await queryDB(
        `INSERT INTO "TaxConfig" (id, "companyId", label, rate, type, "isActive")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        ['demo-tax2', companyId, 'BIC (Impôt sur Sociétés)', 25, 'BIC', true]
      )
      results.push({ table: 'TaxConfig', id: 'demo-tax2', status: 'OK' })
    } catch (e: any) {
      results.push({
        table: 'TaxConfig',
        id: 'demo-tax2',
        status: 'SKIP',
        detail: e.message?.slice(0, 120),
      })
    }

    // ── 10. Subscription + Plan (si pas déjà actif) ──────────
    // S'assurer qu'un plan Business existe
    try {
      await queryDB(
        `INSERT INTO "SubscriptionPlan" (id, name, code, description, "priceMonthly", "priceYearly", "maxUsers", "maxCompanies", features, "isActive")
         VALUES ('ps2', 'Business', 'business', 'Pour les PME ayant besoin d une gestion complète', 49900, 499000, 10, 3,
           '["compta_complete","commercial_full","stocks_advanced","payroll","tax","financial_full","dashboard_premium","chat_full"]', true)
         ON CONFLICT (id) DO NOTHING`
      )
      results.push({ table: 'SubscriptionPlan', id: 'ps2', status: 'OK' })
    } catch (e: any) {
      results.push({
        table: 'SubscriptionPlan',
        id: 'ps2',
        status: 'SKIP',
        detail: e.message?.slice(0, 120),
      })
    }

    // Activer l'abonnement pour la société demo
    try {
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      await queryDB(
        `INSERT INTO "Subscription" (id, companyid, planid, status, paymentperiod, enddate)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (companyid) DO UPDATE SET
           planid = EXCLUDED.planid, status = 'active', enddate = EXCLUDED.enddate`,
        ['demo-sub1', companyId, 'ps2', 'active', 'yearly', endDate]
      )
      results.push({ table: 'Subscription', id: 'demo-sub1', status: 'OK' })
    } catch (e: any) {
      results.push({
        table: 'Subscription',
        id: 'demo-sub1',
        status: 'SKIP',
        detail: e.message?.slice(0, 120),
      })
    }

    // ── Résumé ────────────────────────────────────────────────
    const summary = {
      company: 1,
      clients: clients.length,
      suppliers: suppliers.length,
      items: items.length,
      warehouse: 1,
      employees: employees.length,
      payrolls: payrolls.length,
      fiscalYear: 1,
      journal: 1,
      chartAccounts: accounts.length,
      entries: entries.length,
      entryLines: entries.reduce((sum, e) => sum + e.lines.length, 0),
      taxConfigs: 2,
      subscription: 1,
    }

    return NextResponse.json({
      success: true,
      message: '✅ Données de démonstration insérées avec succès',
      summary,
      details: results,
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        error: e.message || String(e),
        details: results,
      },
      { status: 500 }
    )
  }
}
