import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {

    // --- 1. USER ADMIN ---
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await tx.user.create({
      data: { email: 'admin@lyra.ci', password: hashedPassword, name: 'Admin LYRA', role: 'ADMIN' },
    });
    console.log('OK Admin: ' + adminUser.email);

    // --- 2. COMPANY ---
    const company = await tx.company.create({
      data: {
        name: 'LYRA CI',
        rcNumber: 'CI-ABJ-2024-12345',
        ciNumber: '123456789P',
        address: 'Abidjan, Plateau, Rue des Comptables',
        phone: '+225 01 02 03 04 05',
        email: 'contact@lyra.ci',
      },
    });
    await tx.user.update({ where: { id: adminUser.id }, data: { companyId: company.id } });
    console.log('OK Company: ' + company.name);

    // --- 3. FISCAL YEAR ---
    const fiscalYear = await tx.fiscalYear.create({
      data: { companyId: company.id, label: 'Exercice 2024', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), isClosed: false },
    });
    console.log('OK FiscalYear');

    // --- 4. ACCOUNTS (60 SYSCOHADA) ---
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

    const accounts: Array<{id: string; code: string; label: string; type: string}> = [];
    for (const acc of accountsData) {
      const account = await tx.chartAccount.create({
        data: { companyId: company.id, code: acc.code, label: acc.label, type: acc.type, isActive: true },
      });
      accounts.push(account);
    }
    console.log('OK ' + accounts.length + ' accounts');

    const byCode = (c: string) => {
      const a = accounts.find(x => x.code === c);
      if (!a) throw new Error('Account not found: ' + c);
      return a;
    };

    // --- 5. JOURNALS ---
    const jAC = await tx.journal.create({ data: { fiscalYearId: fiscalYear.id, code: 'AC', label: 'Achats' } });
    const jVE = await tx.journal.create({ data: { fiscalYearId: fiscalYear.id, code: 'VE', label: 'Ventes' } });
    const jOD = await tx.journal.create({ data: { fiscalYearId: fiscalYear.id, code: 'OD', label: 'Operations Diverses' } });
    console.log('OK 3 journals');

    // --- 6. ENTRIES ---
    await tx.entry.create({
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
    console.log('OK VE-001');

    await tx.entry.create({
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
    console.log('OK AC-001');

    await tx.entry.create({
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
    console.log('OK OD-001');

    // --- 7. CUSTOMERS ---
    const c1 = await tx.customer.create({ data: { companyId: company.id, name: 'BIOCOOP AFRIQUE', contact: 'M. Kouame', email: 'contact@biocoop.ci' } });
    const c2 = await tx.customer.create({ data: { companyId: company.id, name: 'SOCIETE NOUVELLE D INVESTISSEMENT', contact: 'Mme Diallo' } });
    console.log('OK 2 customers');

    // --- 8. SUPPLIER ---
    const supp = await tx.supplier.create({ data: { companyId: company.id, name: 'DISTRIPLUS CI', contact: '+225 07 07 07 07' } });
    console.log('OK supplier');

    // --- 9. INVOICE ---
    await tx.invoice.create({
      data: {
        companyId: company.id, customerId: c1.id,
        number: 'FACT-2024-001', date: new Date('2024-02-01'), dueDate: new Date('2024-03-01'),
        totalHT: 500000, totalTVA: 90000, totalTTC: 590000, status: 'PAID',
        lines: { create: [
          { label: 'Consulting SYSCOHADA - Mise en place', quantity: 1, unitPrice: 350000, tvaRate: 18, totalHT: 350000 },
          { label: 'Formation equipe comptable', quantity: 5, unitPrice: 30000, tvaRate: 18, totalHT: 150000 },
        ]},
      },
    });
    console.log('OK invoice');

    // --- 10. ITEMS ---
    const i1 = await tx.item.create({ data: { companyId: company.id, code: 'ART-001', label: 'Consulting Premium', unit: 'U', price: 250000, stock: 10 } });
    const i2 = await tx.item.create({ data: { companyId: company.id, code: 'ART-002', label: 'Formation OHADA', unit: 'U', price: 150000, stock: 20 } });
    const i3 = await tx.item.create({ data: { companyId: company.id, code: 'ART-003', label: 'Audit Financier', unit: 'U', price: 500000, stock: 5 } });
    console.log('OK 3 items');

    // --- 11. WAREHOUSE ---
    const wh = await tx.warehouse.create({ data: { companyId: company.id, label: 'Entrepot Principal - Plateau', location: 'Abidjan Plateau' } });
    await tx.item.update({ where: { id: i1.id }, data: { warehouseId: wh.id } });
    await tx.item.update({ where: { id: i2.id }, data: { warehouseId: wh.id } });
    await tx.item.update({ where: { id: i3.id }, data: { warehouseId: wh.id } });
    console.log('OK warehouse');

    // --- 12. STOCK MOVEMENTS ---
    await tx.stockMovement.create({ data: { warehouseId: wh.id, itemId: i1.id, type: 'IN', quantity: 10, date: new Date('2024-01-01'), note: 'Entree initiale stock Consulting Premium' } });
    await tx.stockMovement.create({ data: { warehouseId: wh.id, itemId: i1.id, type: 'OUT', quantity: 2, date: new Date('2024-01-15'), note: 'Sortie pour prestation client' } });
    console.log('OK 2 stock movements');

    // --- 13. EMPLOYEES ---
    const e1 = await tx.employee.create({ data: { companyId: company.id, firstName: 'Kouame', lastName: 'Jean', position: 'Comptable', baseSalary: 800000, hireDate: new Date('2023-01-01'), contractType: 'CDI' } });
    const e2 = await tx.employee.create({ data: { companyId: company.id, firstName: 'Diallo', lastName: 'Fatou', position: 'Directrice Financiere', baseSalary: 1200000, hireDate: new Date('2022-06-01'), contractType: 'CDI' } });
    console.log('OK 2 employees');

    // --- 14. PAYROLLS ---
    // Kouame Jean: baseSalary=800000, bonuses=50000, indemnites=25000
    const kg = 800000 + 50000 + 25000; // 875000
    const kce = Math.round(kg * 0.063); // 55125
    const kcr = Math.round(kg * 0.165); // 144375
    const k_imposable = kg - kce; // 819875
    // IR: bareme CI 2024: 0-500000=0%, 500001-1000000=10%
    const kir = Math.round((k_imposable - 500000) * 0.10); // 31988
    const kn = kg - kce - kir; // 787887
    await tx.payroll.create({
      data: { employeeId: e1.id, period: '2024-01', baseSalary: 800000, bonuses: 50000, indemnities: 25000, grossSalary: kg, cnpsEmployee: kce, cnpsEmployer: kcr, irTax: kir, netSalary: kn, status: 'PAID' },
    });
    console.log('OK payroll Kouame: gross=' + kg + ' net=' + kn + ' ir=' + kir);

    // Diallo Fatou: baseSalary=1200000, bonuses=100000, indemnites=50000
    const dg = 1200000 + 100000 + 50000; // 1350000
    const dce = Math.round(dg * 0.063); // 85050
    const dcr = Math.round(dg * 0.165); // 222750
    const d_imposable = dg - dce; // 1264950
    // IR: bareme CI 2024: 0-500000=0%, 500001-1000000=10%, 1000001-2000000=20%
    const dir = Math.round((d_imposable - 1000000) * 0.20 + (1000000 - 500000) * 0.10); // 102990
    const dn = dg - dce - dir; // 1161960 (1350000 - 85050 - 102990)
    await tx.payroll.create({
      data: { employeeId: e2.id, period: '2024-01', baseSalary: 1200000, bonuses: 100000, indemnities: 50000, grossSalary: dg, cnpsEmployee: dce, cnpsEmployer: dcr, irTax: dir, netSalary: dn, status: 'PAID' },
    });
    console.log('OK payroll Diallo: gross=' + dg + ' net=' + dn + ' ir=' + dir);

    // --- 15. TAX CONFIG ---
    await tx.taxConfig.create({ data: { companyId: company.id, label: 'TVA Standard', rate: 18, type: 'TVA', isActive: true } });
    console.log('OK tax config');

    // --- 16. OHADA ARTICLES ---
    const articles = [
      { category: "COMPTA", title: "Comptabilite SYSCOHADA", content: "Le Systeme Comptable OHADA (SYSCOHADA) s'applique a toutes les entreprises soumises aux Actes Uniformes OHADA. Il est base sur un plan comptable general comprenant 8 classes de comptes : Classe 1 (Capitaux), Classe 2 (Immobilisations), Classe 3 (Stocks), Classe 4 (Tiers), Classe 5 (Tresorerie), Classe 6 (Charges), Classe 7 (Produits), Classe 8 (Comptes speciaux). Les entreprises doivent tenir une comptabilite reguliere et sincere conformement aux principes comptables OHADA.", source: "Acte Uniforme OHADA - Comptabilite", keywords: "syscohada, plan comptable, ohada, comptabilite, classes de comptes" },
      { category: "FISCALITE", title: "TVA en Cote d'Ivoire", content: "En Cote d'Ivoire, la TVA est au taux standard de 18%. Les entreprises assujetties doivent deposer une declaration mensuelle de TVA avant le 15 du mois suivant. La TVA collectee sur les ventes est diminuee de la TVA deductible sur les achats pour determiner la TVA nette due. Le regime d'imposition peut etre reel normal (declaration mensuelle) ou reel simplifie (declaration trimestrielle avec acomptes mensuels).", source: "Code General des Impots de Cote d'Ivoire", keywords: "tva, taxe sur valeur ajoutee, declaration, cote d ivoire, 18%" },
      { category: "FISCALITE", title: "Impot sur le Revenu (IR) en Cote d'Ivoire", content: "L'Impot sur le Revenu en Cote d'Ivoire est preleve a la source par l'employeur. Le bareme progressif 2024 : 0-500000 : 0%, 500001-1000000 : 10%, 1000001-2000000 : 20%, 2000001-5000000 : 30%, >5000000 : 36%. L'employeur doit reverser mensuellement les retenues a la Direction Generale des Impots. La declaration annuelle de l'IR est obligatoire pour tous les contribuables.", source: "Code General des Impots de Cote d'Ivoire - Bareme IR", keywords: "impot revenu, ir, bareme progressif, preleve source, cote d ivoire" },
      { category: "PAIE", title: "Cotisations Sociales CNPS", content: "Les cotisations sociales CNPS en Cote d'Ivoire se decomposent en part employe (environ 6.3%) et part employeur (environ 16.5%) appliquees sur le salaire brut. Ces cotisations couvrent les risques maladie, maternite, invalidite, vieillesse, deces et allocations familiales. Les employeurs doivent declarer et payer mensuellement les cotisations CNPS avant le 15 du mois suivant. Le non-respect expose a des penalites de retard.", source: "CNPS Cote d'Ivoire - Guide des cotisations", keywords: "cnps, cotisations sociales, securite sociale, employe, employeur, cote d ivoire" },
      { category: "SOCIETES", title: "Droit des Societes OHADA", content: "L'Acte Uniforme OHADA relatif au droit des societes commerciales prevoit plusieurs formes juridiques : SA (Societe Anonyme), SARL (Societe a Responsabilite Limitee), SAS (Societe par Actions Simplifiee), GIE (Groupement d'Interet Economique). Le capital social minimum varie selon la forme : 10 millions FCFA pour SA avec appel public a l'epargne, 1 million FCFA pour SA sans appel public, 1 million FCFA pour SARL. Les societes doivent etre immatriculees au Registre du Commerce et du Credit Mobilier (RCCM).", source: "Acte Uniforme OHADA - Droit des Societes Commerciales", keywords: "ohada, societes commerciales, sa, sarl, sas, gie, capital social, rccm" },
    ];
    for (const a of articles) {
      await tx.ohadaArticle.create({ data: a });
    }
    console.log('OK 5 OHADA articles');

    // --- 17. SUBSCRIPTION PLANS ---
    const starterPlan = await tx.subscriptionPlan.create({
      data: {
        name: 'Starter', code: 'starter',
        description: 'Pour les TPE souhaitant une comptabilite simplifiee',
        priceMonthly: 19900, priceYearly: 199000,
        maxUsers: 3, maxCompanies: 1,
        features: JSON.stringify(['compta_base','commercial_base','stocks_base','financial_basic','dashboard','chat_limited']),
        isActive: true,
      }
    })
    console.log('OK plan: Starter')

    const businessPlan = await tx.subscriptionPlan.create({
      data: {
        name: 'Business', code: 'business',
        description: "Pour les PME ayant besoin d'une gestion complete",
        priceMonthly: 49900, priceYearly: 499000,
        maxUsers: 10, maxCompanies: 3,
        features: JSON.stringify(['compta_complete','commercial_full','stocks_advanced','payroll','tax','financial_full','dashboard_premium','chat_full']),
        isActive: true,
      }
    })
    console.log('OK plan: Business')

    const enterprisePlan = await tx.subscriptionPlan.create({
      data: {
        name: 'Enterprise', code: 'enterprise',
        description: 'Pour les groupes et PME+ avec multi-societes',
        priceMonthly: 99900, priceYearly: 999000,
        maxUsers: 30, maxCompanies: 999,
        features: JSON.stringify(['compta_complete','commercial_full','stocks_advanced','payroll','tax','financial_full','dashboard_premium','chat_full','multi_company','workflows','advanced_roles','custom_reports','support_priority','on_premise']),
        isActive: true,
      }
    })
    console.log('OK plan: Enterprise')

    // --- 18. SUBSCRIPTION pour la societe demo ---
    await tx.subscription.create({
      data: {
        companyId: company.id,
        planId: businessPlan.id,
        status: 'active',
        paymentPeriod: 'monthly',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    })
    console.log('OK subscription: LYRA CI -> Business');

    console.log('');
    console.log('=== SEED COMPLETED SUCCESSFULLY ===');
    console.log('Admin: admin@lyra.ci / admin123');
  });
}

main()
  .catch((e) => {
    console.error('FAILED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
