import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 SEED FULL LYRA ERP — Mode UPSERT');
  console.log('');

  const companyId = 'comp-demo';
  const adminEmail = 'admin@lyra.ci';
  const adminPassword = 'admin123';
  const fiscalYearLabel = 'Exercice 2024';

  // --- 1. SUBSCRIPTION PLANS ---
  console.log('📋 Plans abonnement...');
  const plans = [
    { id: 'plan-starter', name: 'Starter', code: 'starter', desc: 'Pour les TPE souhaitant une comptabilité simplifiée', monthly: 19900, yearly: 199000, maxUsers: 3, maxCompanies: 1, features: ['compta_base','commercial_base','stocks_base','financial_basic','dashboard','chat_limited'] },
    { id: 'plan-business', name: 'Business', code: 'business', desc: "Pour les PME ayant besoin d'une gestion complète", monthly: 49900, yearly: 499000, maxUsers: 10, maxCompanies: 3, features: ['compta_complete','commercial_full','stocks_advanced','payroll','tax','financial_full','dashboard_premium','chat_full'] },
    { id: 'plan-enterprise', name: 'Enterprise', code: 'enterprise', desc: 'Pour les groupes et PME+ avec multi-sociétés', monthly: 99900, yearly: 999000, maxUsers: 30, maxCompanies: 999, features: ['compta_complete','commercial_full','stocks_advanced','payroll','tax','financial_full','dashboard_premium','chat_full','multi_company','workflows','advanced_roles','custom_reports','support_priority','on_premise'] },
  ];
  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: p.code },
      update: { priceMonthly: p.monthly, priceYearly: p.yearly, maxUsers: p.maxUsers, maxCompanies: p.maxCompanies, features: JSON.stringify(p.features), description: p.desc, isActive: true },
      create: { id: p.id, name: p.name, code: p.code, description: p.desc, priceMonthly: p.monthly, priceYearly: p.yearly, maxUsers: p.maxUsers, maxCompanies: p.maxCompanies, features: JSON.stringify(p.features), isActive: true },
    });
  }
  console.log(`  ✅ ${plans.length} plans (Starter/Business/Enterprise)`);

  // --- 2. USER ADMIN ---
  console.log('👤 Admin user...');
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, name: 'Admin LYRA', role: 'ADMIN' },
    create: { email: adminEmail, password: hashedPassword, name: 'Admin LYRA', role: 'ADMIN', emailVerified: true },
  });
  console.log(`  ✅ Admin: ${adminEmail} / ${adminPassword}`);

  // --- 3. COMPANY ---
  console.log('🏢 Company...');
  const company = await prisma.company.upsert({
    where: { id: companyId },
    update: { rcNumber: 'CI-ABJ-2024-12345', ciNumber: '123456789P', address: 'Abidjan Plateau', phone: '+225 01 02 03 04 05', email: 'contact@lyra.ci' },
    create: { id: companyId, name: 'LYRA CI', rcNumber: 'CI-ABJ-2024-12345', ciNumber: '123456789P', address: 'Abidjan Plateau', phone: '+225 01 02 03 04 05', email: 'contact@lyra.ci' },
  });
  await prisma.user.update({ where: { id: user.id }, data: { companyId: company.id } });
  console.log(`  ✅ ${company.name}`);

  // --- 4. SUBSCRIPTION ---
  console.log('📄 Subscription...');
  const businessPlan = await prisma.subscriptionPlan.findUnique({ where: { code: 'business' } });
  if (businessPlan) {
    await prisma.subscription.upsert({
      where: { companyId: company.id },
      update: { planId: businessPlan.id, status: 'active', endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
      create: { companyId: company.id, planId: businessPlan.id, status: 'active', paymentPeriod: 'monthly', endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
    });
    console.log(`  ✅ LYRA CI → Business`);
  }

  // --- 5. FISCAL YEAR ---
  console.log('📅 Exercice fiscal...');
  let fiscalYear = await prisma.fiscalYear.findFirst({ where: { companyId: company.id, label: fiscalYearLabel } });
  if (!fiscalYear) {
    fiscalYear = await prisma.fiscalYear.create({
      data: { companyId: company.id, label: fiscalYearLabel, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31') },
    });
  }
  console.log(`  ✅ ${fiscalYearLabel}`);

  // --- 6. CHART ACCOUNTS (60 SYSCOHADA) ---
  console.log('📒 Plan comptable SYSCOHADA (60 comptes)...');
  const accountsData = [
    { code: "101", label: "Capital social", type: "EQUITY" },
    { code: "106", label: "Reserves legales", type: "EQUITY" },
    { code: "110", label: "Report a nouveau", type: "EQUITY" },
    { code: "120", label: "Resultat de l exercice", type: "EQUITY" },
    { code: "131", label: "Subventions d investissement", type: "LIABILITY" },
    { code: "151", label: "Provisions reglementees", type: "LIABILITY" },
    { code: "161", label: "Emprunts obligataires", type: "LIABILITY" },
    { code: "164", label: "Emprunts bancaires", type: "LIABILITY" },
    { code: "168", label: "Autres emprunts", type: "LIABILITY" },
    { code: "201", label: "Frais de developpement", type: "ASSET" },
    { code: "211", label: "Terrains", type: "ASSET" },
    { code: "213", label: "Constructions", type: "ASSET" },
    { code: "215", label: "Installations techniques", type: "ASSET" },
    { code: "218", label: "Autres immobilisations corporelles", type: "ASSET" },
    { code: "241", label: "Brevets et licences", type: "ASSET" },
    { code: "251", label: "Parts sociales", type: "ASSET" },
    { code: "261", label: "Titres de participation", type: "ASSET" },
    { code: "311", label: "Marchandises", type: "ASSET" },
    { code: "321", label: "Matieres premieres", type: "ASSET" },
    { code: "331", label: "Produits finis", type: "ASSET" },
    { code: "341", label: "Produits en cours", type: "ASSET" },
    { code: "351", label: "Emballages", type: "ASSET" },
    { code: "401", label: "Fournisseurs", type: "LIABILITY" },
    { code: "404", label: "Fournisseurs d immobilisations", type: "LIABILITY" },
    { code: "409", label: "Fournisseurs debiteurs", type: "ASSET" },
    { code: "411", label: "Clients", type: "ASSET" },
    { code: "416", label: "Clients douteux", type: "ASSET" },
    { code: "419", label: "Clients crediteurs", type: "LIABILITY" },
    { code: "421", label: "Personnel", type: "LIABILITY" },
    { code: "424", label: "Securite sociale (CNPS)", type: "LIABILITY" },
    { code: "431", label: "Etat - TVA collectee", type: "LIABILITY" },
    { code: "432", label: "Etat - TVA deductible", type: "ASSET" },
    { code: "433", label: "Etat - Impot sur les benefices", type: "LIABILITY" },
    { code: "434", label: "Etat - IR", type: "LIABILITY" },
    { code: "441", label: "Organismes sociaux", type: "LIABILITY" },
    { code: "451", label: "Debiteurs divers", type: "ASSET" },
    { code: "452", label: "Crediteurs divers", type: "LIABILITY" },
    { code: "471", label: "Comptes d attente", type: "ASSET" },
    { code: "501", label: "Banque", type: "ASSET" },
    { code: "511", label: "Caisse", type: "ASSET" },
    { code: "521", label: "Cheques postaux", type: "ASSET" },
    { code: "561", label: "Virements internes", type: "ASSET" },
    { code: "601", label: "Achats de marchandises", type: "EXPENSE" },
    { code: "602", label: "Achats de matieres premieres", type: "EXPENSE" },
    { code: "604", label: "Achats de fournitures", type: "EXPENSE" },
    { code: "611", label: "Transports", type: "EXPENSE" },
    { code: "621", label: "Locations", type: "EXPENSE" },
    { code: "622", label: "Entretien et reparations", type: "EXPENSE" },
    { code: "623", label: "Primes d assurances", type: "EXPENSE" },
    { code: "624", label: "Honoraires", type: "EXPENSE" },
    { code: "625", label: "Publicite", type: "EXPENSE" },
    { code: "631", label: "Impots et taxes", type: "EXPENSE" },
    { code: "641", label: "Salaires", type: "EXPENSE" },
    { code: "642", label: "Charges sociales (CNPS)", type: "EXPENSE" },
    { code: "651", label: "Dotations aux amortissements", type: "EXPENSE" },
    { code: "661", label: "Interets bancaires", type: "EXPENSE" },
    { code: "671", label: "Penalites", type: "EXPENSE" },
    { code: "701", label: "Ventes de marchandises", type: "REVENUE" },
    { code: "702", label: "Ventes de produits finis", type: "REVENUE" },
    { code: "706", label: "Prestations de services", type: "REVENUE" },
    { code: "711", label: "Subventions d exploitation", type: "REVENUE" },
    { code: "721", label: "Production stockee", type: "REVENUE" },
    { code: "751", label: "Revenus financiers", type: "REVENUE" },
    { code: "771", label: "Produits exceptionnels", type: "REVENUE" },
    { code: "801", label: "Engagements donnes", type: "EXPENSE" },
    { code: "802", label: "Engagements recus", type: "REVENUE" },
    { code: "809", label: "Contrepartie des engagements", type: "EXPENSE" },
  ];

  // Supprimer les anciens comptes pour re-seeder proprement
  await prisma.chartAccount.deleteMany({ where: { companyId: company.id } });

  const accounts: Array<{id: string; code: string; label: string; type: string}> = [];
  for (const acc of accountsData) {
    const account = await prisma.chartAccount.create({
      data: { companyId: company.id, code: acc.code, label: acc.label, type: acc.type, isActive: true },
    });
    accounts.push(account);
  }
  console.log(`  ✅ ${accounts.length} comptes SYSCOHADA`);

  const byCode = (c: string) => {
    const a = accounts.find(x => x.code === c);
    if (!a) throw new Error('Account not found: ' + c);
    return a;
  };

  // --- 7. JOURNALS ---
  console.log('📓 Journaux...');
  await prisma.journal.deleteMany({ where: { fiscalYearId: fiscalYear.id } });
  const jAC = await prisma.journal.create({ data: { fiscalYearId: fiscalYear.id, code: 'AC', label: 'Achats' } });
  const jVE = await prisma.journal.create({ data: { fiscalYearId: fiscalYear.id, code: 'VE', label: 'Ventes' } });
  const jOD = await prisma.journal.create({ data: { fiscalYearId: fiscalYear.id, code: 'OD', label: 'Operations Diverses' } });
  console.log(`  ✅ ${3} journaux (AC, VE, OD)`);

  // --- 8. ENTRIES ---
  console.log('📝 Écritures comptables...');
  await prisma.entry.deleteMany({ where: { journalId: { in: [jAC.id, jVE.id, jOD.id] } } });

  await prisma.entry.create({
    data: {
      journalId: jVE.id, date: new Date('2024-02-01'), reference: 'VE-001',
      label: 'Vente de prestations - BIOCOOP AFRIQUE',
      lines: { create: [
        { accountId: byCode('701').id, accountCode: '701', accountLabel: 'Ventes de marchandises', debit: 0, credit: 500000 },
        { accountId: byCode('501').id, accountCode: '501', accountLabel: 'Banque', debit: 590000, credit: 0 },
        { accountId: byCode('431').id, accountCode: '431', accountLabel: 'Etat - TVA collectee', debit: 0, credit: 90000 },
      ]},
    },
  });

  await prisma.entry.create({
    data: {
      journalId: jAC.id, date: new Date('2024-02-05'), reference: 'AC-001',
      label: 'Achat fournitures de bureau',
      lines: { create: [
        { accountId: byCode('604').id, accountCode: '604', accountLabel: 'Achats de fournitures', debit: 200000, credit: 0 },
        { accountId: byCode('432').id, accountCode: '432', accountLabel: 'Etat - TVA deductible', debit: 36000, credit: 0 },
        { accountId: byCode('401').id, accountCode: '401', accountLabel: 'Fournisseurs', debit: 0, credit: 236000 },
      ]},
    },
  });

  await prisma.entry.create({
    data: {
      journalId: jOD.id, date: new Date('2024-02-28'), reference: 'OD-001',
      label: 'Paie janvier 2024',
      lines: { create: [
        { accountId: byCode('641').id, accountCode: '641', accountLabel: 'Salaires', debit: 2000000, credit: 0 },
        { accountId: byCode('642').id, accountCode: '642', accountLabel: 'Charges sociales (CNPS)', debit: 350000, credit: 0 },
        { accountId: byCode('421').id, accountCode: '421', accountLabel: 'Personnel', debit: 0, credit: 1650000 },
        { accountId: byCode('424').id, accountCode: '424', accountLabel: 'Securite sociale (CNPS)', debit: 0, credit: 350000 },
        { accountId: byCode('434').id, accountCode: '434', accountLabel: 'Etat - IR', debit: 0, credit: 400000 },
      ]},
    },
  });

  // Écriture supplémentaire pour plus de réalisme
  await prisma.entry.create({
    data: {
      journalId: jOD.id, date: new Date('2024-03-15'), reference: 'OD-002',
      label: 'Paiement loyer trimestriel',
      lines: { create: [
        { accountId: byCode('621').id, accountCode: '621', accountLabel: 'Locations', debit: 1500000, credit: 0 },
        { accountId: byCode('501').id, accountCode: '501', accountLabel: 'Banque', debit: 0, credit: 1500000 },
      ]},
    },
  });

  await prisma.entry.create({
    data: {
      journalId: jVE.id, date: new Date('2024-03-20'), reference: 'VE-002',
      label: 'Prestation de conseil - SNI',
      lines: { create: [
        { accountId: byCode('706').id, accountCode: '706', accountLabel: 'Prestations de services', debit: 0, credit: 750000 },
        { accountId: byCode('431').id, accountCode: '431', accountLabel: 'Etat - TVA collectee', debit: 0, credit: 135000 },
        { accountId: byCode('411').id, accountCode: '411', accountLabel: 'Clients', debit: 885000, credit: 0 },
      ]},
    },
  });

  console.log(`  ✅ ${5} écritures comptables`);

  // --- 9. CUSTOMERS ---
  console.log('👥 Clients...');
  await prisma.customer.deleteMany({ where: { companyId: company.id } });
  const customersData = [
    { name: 'BIOCOOP AFRIQUE', contact: 'M. Kouame', email: 'contact@biocoop.ci' },
    { name: 'SOCIETE NOUVELLE D INVESTISSEMENT', contact: 'Mme Diallo' },
    { name: 'ORANGE CI', contact: 'M. Traore', email: 'facturation@orange.ci' },
    { name: 'BICICI', contact: 'M. N Guessan' },
    { name: 'SODECI', contact: 'Mme Konan' },
  ];
  const customers: any[] = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({ data: { companyId: company.id, ...c } });
    customers.push(cust);
  }
  console.log(`  ✅ ${customers.length} clients`);

  // --- 10. SUPPLIERS ---
  console.log('🏭 Fournisseurs...');
  await prisma.supplier.deleteMany({ where: { companyId: company.id } });
  const suppliersData = [
    { name: 'DISTRIPLUS CI', contact: '+225 07 07 07 07' },
    { name: 'ELECTROFRIEND CI', contact: '+225 05 05 05 05' },
    { name: 'BUREAUTIQUE ABIDJAN', contact: 'M. Koffi' },
  ];
  for (const s of suppliersData) {
    await prisma.supplier.create({ data: { companyId: company.id, ...s } });
  }
  console.log(`  ✅ ${suppliersData.length} fournisseurs`);

  // --- 11. INVOICES ---
  console.log('🧾 Factures...');
  await prisma.invoiceLine.deleteMany({ where: { invoice: { companyId: company.id } } });
  await prisma.invoice.deleteMany({ where: { companyId: company.id } });

  const invoicesData = [
    { customer: customers[0], number: 'FACT-2024-001', date: '2024-02-01', dueDate: '2024-03-01', totalHT: 500000, status: 'PAID', lines: [
      { label: 'Consulting SYSCOHADA - Mise en place', qty: 1, up: 350000 },
      { label: 'Formation equipe comptable', qty: 5, up: 30000 },
    ]},
    { customer: customers[1], number: 'FACT-2024-002', date: '2024-02-15', dueDate: '2024-03-15', totalHT: 885000, status: 'PAID', lines: [
      { label: 'Audit financier complet', qty: 1, up: 885000 },
    ]},
    { customer: customers[2], number: 'FACT-2024-003', date: '2024-03-01', dueDate: '2024-04-01', totalHT: 1200000, status: 'UNPAID', lines: [
      { label: 'Logiciel LYRA - Licence Enterprise', qty: 1, up: 1200000 },
    ]},
    { customer: customers[3], number: 'FACT-2024-004', date: '2024-03-10', dueDate: '2024-04-10', totalHT: 450000, status: 'UNPAID', lines: [
      { label: 'Maintenance mensuelle', qty: 3, up: 150000 },
    ]},
    { customer: customers[4], number: 'FACT-2024-005', date: '2024-03-20', dueDate: '2024-04-20', totalHT: 750000, status: 'PAID', lines: [
      { label: 'Deploiement LYRA + Formation', qty: 1, up: 750000 },
    ]},
  ];

  for (const inv of invoicesData) {
    const totalTVA = Math.round(inv.totalHT * 0.18);
    const totalTTC = inv.totalHT + totalTVA;
    await prisma.invoice.create({
      data: {
        companyId: company.id, customerId: inv.customer.id,
        number: inv.number, date: new Date(inv.date), dueDate: new Date(inv.dueDate),
        totalHT: inv.totalHT, totalTVA, totalTTC, status: inv.status,
        lines: { create: inv.lines.map(l => ({
          label: l.label, quantity: l.qty, unitPrice: l.up, tvaRate: 18,
          totalHT: l.qty * l.up,
        }))},
      },
    });
  }
  console.log(`  ✅ ${invoicesData.length} factures`);

  // --- 12. ITEMS ---
  console.log('📦 Articles...');
  await prisma.item.deleteMany({ where: { companyId: company.id } });
  const itemsData = [
    { code: 'ART-001', label: 'Consulting Premium', price: 250000, stock: 10 },
    { code: 'ART-002', label: 'Formation OHADA', price: 150000, stock: 20 },
    { code: 'ART-003', label: 'Audit Financier', price: 500000, stock: 5 },
    { code: 'ART-004', label: 'Licence LYRA - Starter', price: 19900, stock: 100 },
    { code: 'ART-005', label: 'Licence LYRA - Business', price: 49900, stock: 50 },
  ];
  for (const item of itemsData) {
    await prisma.item.create({ data: { companyId: company.id, ...item, unit: 'U' } });
  }
  console.log(`  ✅ ${itemsData.length} articles`);

  // --- 13. WAREHOUSE + MOVEMENTS ---
  console.log('🏬 Entrepôt et mouvements...');
  const items = await prisma.item.findMany({ where: { companyId: company.id } });
  
  // Supprimer les anciens mouvements et entrepôts
  await prisma.stockMovement.deleteMany({ where: { warehouse: { companyId: company.id } } });
  await prisma.warehouse.deleteMany({ where: { companyId: company.id } });

  const wh = await prisma.warehouse.create({
    data: { companyId: company.id, label: 'Entrepot Principal - Plateau', location: 'Abidjan Plateau' },
  });

  for (const item of items) {
    await prisma.item.update({ where: { id: item.id }, data: { warehouseId: wh.id } });
    await prisma.stockMovement.create({
      data: { warehouseId: wh.id, itemId: item.id, type: 'IN', quantity: item.stock, date: new Date('2024-01-01'), note: 'Entrée initiale stock' },
    });
  }
  console.log(`  ✅ 1 entrepôt, ${items.length+2} mouvements de stock`);

  // --- 14. EMPLOYEES ---
  console.log('👔 Employés...');
  await prisma.payroll.deleteMany({ where: { employee: { companyId: company.id } } });
  await prisma.employee.deleteMany({ where: { companyId: company.id } });

  const employeesData = [
    { first: 'Kouame', last: 'Jean', pos: 'Comptable', salary: 800000, date: '2023-01-01', ct: 'CDI' },
    { first: 'Diallo', last: 'Fatou', pos: 'Directrice Financière', salary: 1200000, date: '2022-06-01', ct: 'CDI' },
    { first: 'Konan', last: 'Paul', pos: 'Commercial', salary: 600000, date: '2023-03-01', ct: 'CDI' },
    { first: 'Touré', last: 'Mariam', pos: 'RH', salary: 550000, date: '2023-09-01', ct: 'CDI' },
    { first: 'N Guessan', last: 'David', pos: 'Assistant Comptable', salary: 350000, date: '2024-01-15', ct: 'CDD' },
  ];

  const employees: any[] = [];
  for (const e of employeesData) {
    const emp = await prisma.employee.create({
      data: { companyId: company.id, firstName: e.first, lastName: e.last, position: e.pos, baseSalary: e.salary, hireDate: new Date(e.date), contractType: e.ct },
    });
    employees.push(emp);
  }
  console.log(`  ✅ ${employees.length} employés`);

  // --- 15. PAYROLLS ---
  console.log('💰 Paies...');
  const calcPayroll = (baseSalary: number, bonuses: number, indemnities: number) => {
    const grossSalary = baseSalary + bonuses + indemnities;
    const cnpsEmployee = Math.round(grossSalary * 0.063);
    const cnpsEmployer = Math.round(grossSalary * 0.165);
    const imposable = grossSalary - cnpsEmployee;
    // Barème IR CI 2024
    let irTax = 0;
    if (imposable > 2000000) irTax = (imposable - 2000000) * 0.30 + (2000000 - 1000000) * 0.20 + (1000000 - 500000) * 0.10;
    else if (imposable > 1000000) irTax = (imposable - 1000000) * 0.20 + (1000000 - 500000) * 0.10;
    else if (imposable > 500000) irTax = (imposable - 500000) * 0.10;
    const netSalary = grossSalary - cnpsEmployee - irTax;
    return { grossSalary, cnpsEmployee, cnpsEmployer, irTax: Math.round(irTax), netSalary: Math.round(netSalary) };
  };

  const payData = [
    { emp: employees[0], bonuses: 50000, indemnities: 25000 },
    { emp: employees[1], bonuses: 100000, indemnities: 50000 },
    { emp: employees[2], bonuses: 30000, indemnities: 10000 },
    { emp: employees[3], bonuses: 25000, indemnities: 15000 },
    { emp: employees[4], bonuses: 0, indemnities: 0 },
  ];

  for (const p of payData) {
    const calc = calcPayroll(p.emp.baseSalary, p.bonuses, p.indemnities);
    await prisma.payroll.create({
      data: {
        employeeId: p.emp.id, period: '2024-06',
        baseSalary: p.emp.baseSalary, bonuses: p.bonuses, indemnities: p.indemnities,
        grossSalary: calc.grossSalary, cnpsEmployee: calc.cnpsEmployee,
        cnpsEmployer: calc.cnpsEmployer, irTax: calc.irTax, netSalary: calc.netSalary,
        status: 'PAID',
      },
    });
    console.log(`  → ${p.emp.firstName} ${p.emp.lastName}: brut=${calc.grossSalary.toLocaleString()} net=${calc.netSalary.toLocaleString()} IR=${calc.irTax.toLocaleString()}`);
  }

  // --- 16. TAX CONFIG ---
  console.log('⚙️ Configuration fiscale...');
  await prisma.taxConfig.deleteMany({ where: { companyId: company.id } });
  await prisma.taxConfig.create({ data: { companyId: company.id, label: 'TVA Standard', rate: 18, type: 'TVA', isActive: true } });
  await prisma.taxConfig.create({ data: { companyId: company.id, label: 'CNPS Employé', rate: 6.3, type: 'CNPS_EMP', isActive: true } });
  await prisma.taxConfig.create({ data: { companyId: company.id, label: 'CNPS Employeur', rate: 16.5, type: 'CNPS_EMPLOYER', isActive: true } });
  console.log(`  ✅ 3 configurations (TVA 18%, CNPS 6.3%/16.5%)`);

  // --- 17. TAX DECLARATIONS ---
  console.log('📊 Déclarations TVA...');
  const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
  for (const month of months) {
    const collected = Math.round(500000 + Math.random() * 300000);
    const deductible = Math.round(200000 + Math.random() * 150000);
    await prisma.taxDeclaration.create({
      data: { companyId: company.id, period: month, totalCollected: collected, totalDeductible: deductible, netDue: collected - deductible, status: month < '2024-04' ? 'PAID' : 'PENDING' },
    });
  }
  console.log(`  ✅ ${months.length} déclarations TVA (${months.filter(m => m < '2024-04').length} payées, ${months.filter(m => m >= '2024-04').length} en attente)`);

  // --- 18. OHADA ARTICLES (RAG Chat) ---
  console.log('📚 Articles OHADA pour le Chat RAG...');
  await prisma.ohadaArticle.deleteMany({});

  const articles = [
    {
      category: "COMPTA",
      title: "Comptabilité SYSCOHADA",
      content: "Le Système Comptable OHADA (SYSCOHADA) s'applique à toutes les entreprises soumises aux Actes Uniformes OHADA. Il est basé sur un plan comptable général comprenant 8 classes de comptes : Classe 1 (Capitaux), Classe 2 (Immobilisations), Classe 3 (Stocks), Classe 4 (Tiers), Classe 5 (Trésorerie), Classe 6 (Charges), Classe 7 (Produits), Classe 8 (Comptes spéciaux). Les entreprises doivent tenir une comptabilité régulière et sincère conformément aux principes comptables OHADA. Les états financiers annuels comprennent le Bilan, le Compte de Résultat, le Tableau des Flux de Trésorerie (TAFIRE) et les Notes Annexes. Le SYSCOHADA révisé en 2016 a introduit des modifications importantes notamment sur les normes d'évaluation et de présentation.",
      source: "Acte Uniforme OHADA - Comptabilité",
      keywords: "syscohada, plan comptable, ohada, comptabilité, classes de comptes, bilan, resultat, etats financiers"
    },
    {
      category: "FISCALITE",
      title: "TVA en Côte d'Ivoire",
      content: "En Côte d'Ivoire, la TVA est au taux standard de 18%. Les entreprises assujetties doivent déposer une déclaration mensuelle de TVA avant le 15 du mois suivant. La TVA collectée sur les ventes est diminuée de la TVA déductible sur les achats pour déterminer la TVA nette due. Le régime d'imposition peut être réel normal (déclaration mensuelle) ou réel simplifié (déclaration trimestrielle avec acomptes mensuels). Les entreprises dont le chiffre d'affaires annuel est inférieur à 50 millions FCFA peuvent bénéficier du régime de la franchise de TVA. La TVA due est liquidée sur les opérations imposables réalisées en Côte d'Ivoire.",
      source: "Code Général des Impôts de Côte d'Ivoire",
      keywords: "tva, taxe sur valeur ajoutée, déclaration, côte d'ivoire, 18%, collectée, déductible"
    },
    {
      category: "FISCALITE",
      title: "Impôt sur le Revenu (IR) en Côte d'Ivoire",
      content: "L'Impôt sur le Revenu en Côte d'Ivoire est prélevé à la source par l'employeur. Le barème progressif 2024 : 0-500000 : 0%, 500001-1000000 : 10%, 1000001-2000000 : 20%, 2000001-5000000 : 30%, >5000000 : 36%. L'employeur doit reverser mensuellement les retenues à la Direction Générale des Impôts avant le 15 du mois suivant. La déclaration annuelle de l'IR est obligatoire pour tous les contribuables. L'Impôt sur les Sociétés (IS) est au taux de 25% du bénéfice imposable. Les entreprises nouvelles bénéficient d'exonérations pendant les 2 à 5 premières années selon leur implantation.",
      source: "Code Général des Impôts de Côte d'Ivoire - Barème IR",
      keywords: "impôt revenu, ir, barème progressif, prélevé source, côte d'ivoire, impot societe"
    },
    {
      category: "PAIE",
      title: "Cotisations Sociales CNPS",
      content: "Les cotisations sociales CNPS en Côte d'Ivoire se décomposent en part employé (environ 6.3%) et part employeur (environ 16.5%) appliquées sur le salaire brut. Ces cotisations couvrent les risques maladie, maternité, invalidité, vieillesse, décès et allocations familiales. Les employeurs doivent déclarer et payer mensuellement les cotisations CNPS avant le 15 du mois suivant. Le non-respect expose à des pénalités de retard de 1% par mois. La CNPS gère également les prestations familiales, les accidents du travail et les maladies professionnelles.",
      source: "CNPS Côte d'Ivoire - Guide des cotisations",
      keywords: "cnps, cotisations sociales, sécurité sociale, employé, employeur, côte d'ivoire, prestations"
    },
    {
      category: "SOCIETES",
      title: "Droit des Sociétés OHADA",
      content: "L'Acte Uniforme OHADA relatif au droit des sociétés commerciales prévoit plusieurs formes juridiques : SA (Société Anonyme), SARL (Société à Responsabilité Limitée), SAS (Société par Actions Simplifiée), GIE (Groupement d'Intérêt Economique). Le capital social minimum varie selon la forme : 10 millions FCFA pour SA avec appel public à l'épargne, 1 million FCFA pour SA sans appel public, 1 million FCFA pour SARL. Les sociétés doivent être immatriculées au Registre du Commerce et du Crédit Mobilier (RCCM). Les formalités de création incluent les statuts notariés, le dépôt de capital et la publication au journal d'annonces légales.",
      source: "Acte Uniforme OHADA - Droit des Sociétés Commerciales",
      keywords: "ohada, sociétés commerciales, sa, sarl, sas, gie, capital social, rccm, création"
    },
    {
      category: "FISCALITE",
      title: "BIC - Bénéfices Industriels et Commerciaux",
      content: "Les Bénéfices Industriels et Commerciaux (BIC) concernent les entreprises commerciales, industrielles et artisanales. Le bénéfice imposable est déterminé après déduction des charges nécessaires à l'exploitation. Les investissements en immobilisations sont amortissables selon les taux suivants : constructions 5%, matériel 10-20%, véhicules 20-25%, mobiliers 10%. Les provisions pour créances douteuses sont déductibles sous conditions. Le déficit d'un exercice peut être reporté sur les bénéfices des 3 exercices suivants.",
      source: "Code Général des Impôts de Côte d'Ivoire - BIC",
      keywords: "bic, bénéfices industriels commerciaux, résultat fiscal, amortissements, provisions"
    },
    {
      category: "COMPTA",
      title: "Bilan et Compte de Résultat OHADA",
      content: "Le bilan est un état financier qui présente la situation patrimoniale de l'entreprise à un moment donné. Il se compose de l'Actif (emplois économiques) et du Passif (ressources financières). L'Actif comprend l'Actif Non Courant (immobilisations) et l'Actif Courant (stocks, créances, trésorerie). Le Passif comprend les Capitaux Propres, le Passif Non Courant (dettes long terme) et le Passif Courant (dettes court terme). Le Compte de Résultat (CPC) présente les produits et les charges d'une période, dégageant le résultat net. La présentation est en liste avec des soldes intermédiaires de gestion.",
      source: "SYSCOHADA Révisé - Modèles d'états financiers",
      keywords: "bilan, compte résultat, cpc, actif, passif, capitaux propres, soldes intermediaires"
    },
    {
      category: "PAIE",
      title: "Calcul de la Paie et Fiche de Paie",
      content: "La fiche de paie en Côte d'Ivoire doit comporter : le salaire de base, les primes et indemnités, le salaire brut, les cotisations CNPS (6.3% employé, 16.5% employeur), l'IR (impôt sur le revenu selon barème progressif), le net à payer. Le SMIG en Côte d'Ivoire est de 60 000 FCFA mensuels. Les heures supplémentaires sont majorées de 15% (8 premières heures), 50% (heures suivantes). Les congés payés sont de 2.5 jours ouvrables par mois de travail. La prime d'ancienneté est de 1% par année d'ancienneté dans la limite de 15%.",
      source: "Code du Travail de Côte d'Ivoire",
      keywords: "paie, fiche paie, bulletin salaire, smig, cotisations, cnps, ir, net payer"
    },
    {
      category: "COMPTA",
      title: "TAFIRE - Tableau des Flux de Trésorerie",
      content: "Le TAFIRE (Tableau des Flux de Trésorerie) est un état financier obligatoire selon le SYSCOHADA. Il présente les flux de trésorerie classés en trois catégories : Flux de trésorerie liés aux activités d'exploitation, Flux liés aux activités d'investissement, Flux liés aux activités de financement. Il permet d'expliquer la variation de la trésorerie entre deux exercices. La méthode directe est préconisée par l'OHADA pour présenter les flux d'exploitation. Le TAFIRE est un outil essentiel pour l'analyse de la liquidité et de la solvabilité de l'entreprise.",
      source: "SYSCOHADA Révisé - TAFIRE",
      keywords: "tafire, flux trésorerie, cash flow, exploitation, investissement, financement"
    },
    {
      category: "FISCALITE",
      title: "Impôt sur les Sociétés (IS)",
      content: "L'Impôt sur les Sociétés (IS) en Côte d'Ivoire est au taux de 25% du bénéfice imposable. Les entreprises nouvelles bénéficient d'exonérations partielles ou totales selon leur secteur et localisation. Les zones franches industrielles bénéficient d'exonérations totales pendant les 5 premières années. L'IS est déclaré et payé mensuellement ou trimestriellement selon le régime d'imposition. Les acomptes sont calculés sur la base de l'impôt dû au titre du dernier exercice clos. La déclaration annuelle de résultat doit être déposée dans les 3 mois suivant la clôture de l'exercice.",
      source: "Code Général des Impôts de Côte d'Ivoire - Impôt Sociétés",
      keywords: "is, impot sociétés, taux 25%, bénéfice imposable, exonérations, acomptes, déclaration"
    },
    {
      category: "COMPTA",
      title: "Liasse Fiscale OHADA",
      content: "La liasse fiscale OHADA est un ensemble de documents comptables et fiscaux que les entreprises doivent déposer annuellement. Elle comprend : le Bilan, le Compte de Résultat (CPC), le TAFIRE, les Notes Annexes, et les déclarations fiscales (IS, IR, TVA). Les entreprises assujetties à la TVA doivent également fournir les relevés de TVA. La liasse doit être déposée dans les 3 mois suivant la clôture de l'exercice social. Le dépôt se fait auprès de la Direction Générale des Impôts du lieu du siège social.",
      source: "DGI Côte d'Ivoire - Guide de la Liasse Fiscale",
      keywords: "liasse fiscale, déclaration annuelle, bilan, cpc, tafire, dgi, côte d'ivoire"
    },
    {
      category: "SOCIETES",
      title: "Guide de Création d'Entreprise en Côte d'Ivoire",
      content: "Pour créer une entreprise en Côte d'Ivoire, les étapes sont : 1) Réservation du nom au Guichet Unique (CEPICI), 2) Dépôt du capital dans une banque, 3) Rédaction des statuts par un notaire, 4) Immatriculation au RCCM, 5) Obtention du Numéro d'Identification Unique (NIU), 6) Immatriculation à la CNPS. Le délai moyen est de 5 à 10 jours ouvrés. Le coût varie selon la forme juridique : environ 150 000 FCFA pour une SARL, 300 000 FCFA pour une SA. Les entreprises peuvent bénéficier du statut de PME ou de start-up innovante.",
      source: "CEPICI - Guide de création d'entreprise",
      keywords: "création entreprise, côte d'ivoire, cepici, guichet unique, immatriculation, rccm, niu"
    },
    {
      category: "PAIE",
      title: "Gestion des Congés et Absences",
      content: "En Côte d'Ivoire, le Code du Travail prévoit : 2.5 jours ouvrables de congés payés par mois de travail effectif (soit 30 jours par an). Les absences justifiées (maladie, maternité) n'affectent pas l'acquisition des congés. La durée du congé de maternité est de 14 semaines (6 avant, 8 après). Les jours fériés légaux (environ 13 par an) ne sont pas décomptés des congés. L'indemnité de congé est égale au 1/10e de la rémunération brute perçue au cours de la période de référence.",
      source: "Code du Travail de Côte d'Ivoire - Titre III",
      keywords: "congés, absences, code travail, maternité, jours fériés, indemnité congé"
    },
    {
      category: "FISCALITE",
      title: "CNPS - Guide des Déclarations",
      content: "La déclaration CNPS s'effectue mensuellement via le portail en ligne. Les taux applicables en 2024 : Part employé 6.3% (maladie 1%, maternité 0.3%, vieillesse 3.2%, décès 0.8%, allocations familiales 1%), Part employeur 16.5%. L'assiette maximale des cotisations est de 2 000 000 FCFA par mois. Les pénalités de retard sont de 1% par mois de retard avec un minimum de 10 000 FCFA. Les employeurs doivent tenir un registre unique du personnel. La CNPS propose des services de télé-déclaration.",
      source: "CNPS Côte d'Ivoire - Guide déclarations 2024",
      keywords: "cnps déclaration, cotisations, taux, pénalités, télé-déclaration, registre personnel"
    },
    {
      category: "COMPTA",
      title: "Exercice Comptable et Clôture",
      content: "L'exercice comptable correspond à une période de 12 mois (généralement du 1er janvier au 31 décembre). Les opérations de clôture comprennent : les amortissements, les provisions, les régularisations de charges et produits (charges constatées d'avance, produits constatés d'avance), les écritures d'inventaire, les cessions d'immobilisations. La balance avant inventaire, la balance après inventaire et la balance définitive sont les étapes de la clôture. Les comptes annuels doivent être approuvés par l'assemblée générale dans les 6 mois suivant la clôture.",
      source: "SYSCOHADA - Guide de clôture d'exercice",
      keywords: "exercice comptable, clôture, amortissements, provisions, régularisations, inventaire"
    },
    {
      category: "FISCALITE",
      title: "Taxe d'Apprentissage et FPC",
      content: "La Taxe d'Apprentissage (TA) et la Formation Professionnelle Continue (FPC) sont des taxes assises sur les salaires. Le taux de la TA est de 1% de la masse salariale brute. Le taux de la FPC est de 0.5% de la masse salariale brute pour les entreprises de 1 à 10 salariés, et 1% pour les entreprises de plus de 10 salariés. Ces taxes sont déclarées et reversées mensuellement à la Direction Générale des Impôts.",
      source: "Code Général des Impôts - Taxes assises sur salaires",
      keywords: "taxe apprentissage, formation professionnelle, fpc, masse salariale, impots assis salaires"
    },
    {
      category: "SOCIETES",
      title: "Obligations Comptables des PME",
      content: "Les PME en Côte d'Ivoire ont des obligations comptables allégées selon le SYSCOHADA. Une PME peut tenir une comptabilité simplifiée si son chiffre d'affaires annuel est inférieur à 100 millions FCFA. Les obligations minimales incluent : un livre journal, un grand livre, une balance, un livre d'inventaire. Les états financiers simplifiés comprennent un bilan abrégé, un compte de résultat abrégé et une situation des créances et dettes. Les documents doivent être conservés 10 ans.",
      source: "OHADA - Guide des PME",
      keywords: "pme, obligations comptables, comptabilité simplifiée, livre journal, grand livre, conservation"
    },
  ];

  for (const a of articles) {
    await prisma.ohadaArticle.create({ data: a });
  }
  console.log(`  ✅ ${articles.length} articles OHADA pour le Chat RAG`);

  // --- FINAL ---
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  ✅ SEED COMPLET — LYRA ERP by Vivalys');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log(`  Admin:  ${adminEmail} / ${adminPassword}`);
  console.log(`  URL:    https://lyra-erp.vercel.app`);
  console.log('');
  
  // Stats
  const stats: Record<string, number> = {
    'Plans': await prisma.subscriptionPlan.count(),
    'Users': await prisma.user.count(),
    'Companies': await prisma.company.count(),
    'Comptes SYSCOHADA': await prisma.chartAccount.count({ where: { companyId: company.id } }),
    'Journaux': await prisma.journal.count({ where: { fiscalYear: { companyId: company.id } } }),
    'Écritures': await prisma.entry.count({ where: { journal: { fiscalYear: { companyId: company.id } } } }),
    'Clients': await prisma.customer.count({ where: { companyId: company.id } }),
    'Fournisseurs': await prisma.supplier.count({ where: { companyId: company.id } }),
    'Factures': await prisma.invoice.count({ where: { companyId: company.id } }),
    'Articles': await prisma.item.count({ where: { companyId: company.id } }),
    'Employés': await prisma.employee.count({ where: { companyId: company.id } }),
    'Bulletins paie': await prisma.payroll.count({ where: { employee: { companyId: company.id } } }),
    'Déclarations TVA': await prisma.taxDeclaration.count({ where: { companyId: company.id } }),
    'Articles OHADA (RAG)': await prisma.ohadaArticle.count(),
  };

  console.log('  📊 STATISTIQUES :');
  for (const [label, count] of Object.entries(stats)) {
    const padded = label.padEnd(25);
    console.log(`    ${padded} : ${count}`);
  }
  console.log('');
  console.log('  🔗 https://lyra-erp.vercel.app');
  console.log('═══════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ FAILED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
