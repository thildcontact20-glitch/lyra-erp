-- SubscriptionPlans
INSERT INTO "SubscriptionPlan" (id, name, code, description, "priceMonthly", "priceYearly", "maxUsers", "maxCompanies", features, "isActive") VALUES
('plan-starter', 'Starter', 'starter', 'Pour les TPE', 19900, 199000, 3, 1, '["compta_base","commercial_base","stocks_base","financial_basic","dashboard","chat_limited"]', true),
('plan-business', 'Business', 'business', 'Pour les PME', 49900, 499000, 10, 3, '["compta_complete","commercial_full","stocks_advanced","payroll","tax","financial_full","dashboard_premium","chat_full"]', true),
('plan-enterprise', 'Enterprise', 'enterprise', 'Pour les groupes', 99900, 999000, 30, 999, '["compta_complete","commercial_full","stocks_advanced","payroll","tax","financial_full","dashboard_premium","chat_full","multi_company","workflows","advanced_roles","custom_reports","support_priority","on_premise"]', true)
ON CONFLICT (code) DO NOTHING;

-- User admin
INSERT INTO "User" (id, email, password, name, role) VALUES
('user-admin', 'admin@lyra.ci', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmEGYXHjlM5VBiJMjy2u', 'Admin LYRA', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Company demo
INSERT INTO "Company" (id, name, "rcNumber", "ciNumber", address, phone, email) VALUES
('comp-demo', 'LYRA CI', 'CI-ABJ-2024-12345', '123456789P', 'Abidjan Plateau', '+225 0102030405', 'contact@lyra.ci')
ON CONFLICT (id) DO NOTHING;

-- Link
UPDATE "User" SET "companyId" = 'comp-demo' WHERE id = 'user-admin';

-- Subscription
INSERT INTO "Subscription" (id, "companyId", "planId", status, "paymentPeriod", "endDate") VALUES
('sub-demo', 'comp-demo', 'plan-business', 'active', 'monthly', NOW() + INTERVAL '30 days')
ON CONFLICT ("companyId") DO NOTHING;

SELECT 'OK' as msg;
