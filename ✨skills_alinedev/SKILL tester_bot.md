---
name: "@tester_bot"
description: "Cria testes E2E com Playwright que simulam login de múltiplos tenants e provam que os dados de um não vazam para o outro. Foco em isolamento e fluxos críticos."
when_to_use: "Use ao criar a suíte de testes E2E, ao adicionar novos fluxos críticos (login, pagamento, configurações), ou ao validar que o isolamento de tenant está funcionando antes de um deploy."
---

# @tester_bot — Testes E2E Multi-Tenant com Playwright

## Descrição

Cria e mantém a suíte de testes E2E (End-to-End) usando Playwright, com foco em provar que o isolamento de dados entre tenants é hermético. Simula cenários reais de uso por múltiplos clientes simultâneos.

---

## Instruções Técnicas

### 1. Configuração do Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Setup: cria os tenants de teste antes de tudo
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // Testes de Tenant A
    {
      name: 'tenant-a-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/tenant-a.json',
      },
      dependencies: ['setup'],
    },

    // Testes de Tenant B
    {
      name: 'tenant-b-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/tenant-b.json',
      },
      dependencies: ['setup'],
    },

    // Testes de isolamento (roda sem autenticação prévia)
    {
      name: 'isolation-tests',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### 2. Setup de Autenticação por Tenant

```typescript
// tests/e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const TENANT_A = {
  email: process.env.TEST_TENANT_A_EMAIL!,
  password: process.env.TEST_TENANT_A_PASSWORD!,
  subdomain: 'tenant-a',
  storageFile: 'tests/.auth/tenant-a.json',
};

const TENANT_B = {
  email: process.env.TEST_TENANT_B_EMAIL!,
  password: process.env.TEST_TENANT_B_PASSWORD!,
  subdomain: 'tenant-b',
  storageFile: 'tests/.auth/tenant-b.json',
};

setup('Autenticar como Tenant A', async ({ page }) => {
  await page.goto(`http://${TENANT_A.subdomain}.localhost:3000/login`);
  await page.getByLabel('E-mail').fill(TENANT_A.email);
  await page.getByLabel('Senha').fill(TENANT_A.password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Aguarda redirecionamento para o dashboard
  await page.waitForURL('**/dashboard');
  await expect(page.getByTestId('dashboard-header')).toBeVisible();

  // Salva o estado de autenticação
  await page.context().storageState({ path: TENANT_A.storageFile });
});

setup('Autenticar como Tenant B', async ({ page }) => {
  await page.goto(`http://${TENANT_B.subdomain}.localhost:3000/login`);
  await page.getByLabel('E-mail').fill(TENANT_B.email);
  await page.getByLabel('Senha').fill(TENANT_B.password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.waitForURL('**/dashboard');
  await expect(page.getByTestId('dashboard-header')).toBeVisible();

  await page.context().storageState({ path: TENANT_B.storageFile });
});
```

### 3. Testes de Isolamento de Dados (CRÍTICO)

```typescript
// tests/e2e/tenant-isolation.spec.ts
import { test, expect } from '@playwright/test';

/**
 * SUITE CRÍTICA: Prova que os dados de um tenant não vazam para outro.
 * Estes testes DEVEM passar antes de qualquer deploy em produção.
 */
test.describe('Isolamento de Dados entre Tenants', () => {

  test('Tenant A não vê usuários do Tenant B', async ({ browser }) => {
    // Cria dois contextos de browser independentes (sessões separadas)
    const contextA = await browser.newContext({
      storageState: 'tests/.auth/tenant-a.json',
    });
    const contextB = await browser.newContext({
      storageState: 'tests/.auth/tenant-b.json',
    });

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Tenant B cria um usuário
    await pageB.goto('http://tenant-b.localhost:3000/dashboard/users');
    await pageB.getByRole('button', { name: 'Adicionar Usuário' }).click();
    await pageB.getByLabel('Nome').fill('Usuário Exclusivo do Tenant B');
    await pageB.getByLabel('E-mail').fill('exclusivo@tenant-b.com');
    await pageB.getByRole('button', { name: 'Salvar' }).click();
    await expect(pageB.getByText('Usuário Exclusivo do Tenant B')).toBeVisible();

    // Tenant A NÃO deve ver o usuário do Tenant B
    await pageA.goto('http://tenant-a.localhost:3000/dashboard/users');
    await expect(pageA.getByText('Usuário Exclusivo do Tenant B')).not.toBeVisible();
    await expect(pageA.getByText('exclusivo@tenant-b.com')).not.toBeVisible();

    await contextA.close();
    await contextB.close();
  });

  test('Tenant A não vê configurações de branding do Tenant B', async ({ browser }) => {
    const contextA = await browser.newContext({
      storageState: 'tests/.auth/tenant-a.json',
    });
    const contextB = await browser.newContext({
      storageState: 'tests/.auth/tenant-b.json',
    });

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Tenant B define uma cor primária única
    await pageB.goto('http://tenant-b.localhost:3000/dashboard/settings/branding');
    await pageB.getByTestId('primary-color-input').fill('#FF6B35');
    await pageB.getByRole('button', { name: 'Salvar Tema' }).click();
    await expect(pageB.getByText('Tema salvo com sucesso')).toBeVisible();

    // Tenant A deve ter sua própria cor, não a do Tenant B
    await pageA.goto('http://tenant-a.localhost:3000/dashboard/settings/branding');
    const colorInputA = pageA.getByTestId('primary-color-input');
    await expect(colorInputA).not.toHaveValue('#FF6B35');

    await contextA.close();
    await contextB.close();
  });

  test('API retorna 403 ao tentar acessar dados de outro tenant', async ({ request }) => {
    // Obtém o token do Tenant A
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: process.env.TEST_TENANT_A_EMAIL,
        password: process.env.TEST_TENANT_A_PASSWORD,
      },
    });
    const { token } = await loginResponse.json();

    // Tenta acessar configurações do Tenant B com token do Tenant A
    const tenantBId = process.env.TEST_TENANT_B_ID!;
    const response = await request.get(`/api/admin/tenants/${tenantBId}/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(403);
  });

  test('Landing Page do Tenant A exibe conteúdo correto (não do Tenant B)', async ({ page }) => {
    // Configura conteúdo único para cada tenant via API
    // (assumindo que os tenants já têm conteúdo configurado no setup)

    await page.goto('http://tenant-a.localhost:3000');
    const heroTitle = await page.getByTestId('hero-title').textContent();

    await page.goto('http://tenant-b.localhost:3000');
    const heroTitleB = await page.getByTestId('hero-title').textContent();

    // Os títulos devem ser diferentes (cada tenant tem seu próprio conteúdo)
    expect(heroTitle).not.toBe(heroTitleB);
  });
});
```

### 4. Testes de Fluxo Crítico por Tenant

```typescript
// tests/e2e/tenant-flows.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Fluxo de Onboarding do Tenant', () => {
  test('Novo tenant consegue completar o onboarding', async ({ page }) => {
    // Simula cadastro de novo tenant
    await page.goto('/signup');
    await page.getByLabel('Nome da empresa').fill('Empresa Teste E2E');
    await page.getByLabel('E-mail').fill(`e2e-${Date.now()}@teste.com`);
    await page.getByLabel('Senha').fill('Senha@Segura123');
    await page.getByLabel('Subdomínio').fill(`e2e-${Date.now()}`);
    await page.getByRole('button', { name: 'Criar conta' }).click();

    // Deve ir para o wizard de onboarding
    await page.waitForURL('**/onboarding');
    await expect(page.getByText('Configure seu app')).toBeVisible();

    // Passo 1: Branding
    await page.getByTestId('primary-color-input').fill('#8B5CF6');
    await page.getByRole('button', { name: 'Próximo' }).click();

    // Passo 2: Conteúdo da LP
    await page.getByLabel('Título principal').fill('Meu App Incrível');
    await page.getByRole('button', { name: 'Finalizar' }).click();

    // Deve ir para o dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.getByTestId('dashboard-header')).toBeVisible();
  });
});

test.describe('Fluxo de Customização de Tema', () => {
  test.use({ storageState: 'tests/.auth/tenant-a.json' });

  test('Admin consegue alterar cor primária e ver preview em tempo real', async ({ page }) => {
    await page.goto('http://tenant-a.localhost:3000/dashboard/settings/branding');

    const colorInput = page.getByTestId('primary-color-input');
    await colorInput.fill('#E11D48'); // Rose-600

    // Verifica preview em tempo real (CSS var deve mudar)
    const primaryColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
    );
    expect(primaryColor).toBe('#E11D48');

    // Salva e verifica persistência
    await page.getByRole('button', { name: 'Salvar Tema' }).click();
    await expect(page.getByText('Tema salvo com sucesso')).toBeVisible();

    // Recarrega e verifica que a cor foi persistida
    await page.reload();
    const persistedColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
    );
    expect(persistedColor).toBe('#E11D48');
  });
});
```

### 5. Variáveis de Ambiente para Testes

```bash
# tests/.env.test
PLAYWRIGHT_BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_DOMAIN=localhost:3000

# Tenant A (usuário admin)
TEST_TENANT_A_EMAIL=admin@tenant-a.com
TEST_TENANT_A_PASSWORD=TesteSenha@123
TEST_TENANT_A_ID=uuid-do-tenant-a

# Tenant B (usuário admin)
TEST_TENANT_B_EMAIL=admin@tenant-b.com
TEST_TENANT_B_PASSWORD=TesteSenha@456
TEST_TENANT_B_ID=uuid-do-tenant-b

# Supabase (ambiente de teste separado!)
SUPABASE_URL=https://seu-projeto-test.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-de-teste
```

### 6. Scripts no package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:isolation": "playwright test --grep 'Isolamento'",
    "test:e2e:report": "playwright show-report"
  }
}
```

### 7. Checklist de Testes

- [ ] Testes de isolamento passam para todas as tabelas críticas?
- [ ] O setup de autenticação cria sessões independentes por tenant?
- [ ] Os testes rodam em ambiente de teste separado (não produção)?
- [ ] Dados de teste são limpos após cada suite (`afterAll`)?
- [ ] Os testes cobrem: login, dashboard, configurações, LP pública?
- [ ] CI/CD executa os testes antes de cada deploy?

# Skill: E2E Tester & QA Bot
## Descrição
Especialista em automação de testes End-to-End (E2E) usando Playwright. Foca em validar fluxos críticos de SaaS White Label.

## Quando usar
Antes de qualquer deploy ou quando o comando `/test` for acionado.

## Instruções Técnicas
1. **Teste de Isolamento (Crítico):** Crie um teste que:
   - Loga com o Usuário A (Tenant A).
   - Tenta acessar a URL de um recurso do Usuário B (Tenant B).
   - **Sucesso:** Se o sistema retornar 403/404. **Falha:** Se mostrar dados.
2. **Teste Visual de Branding:**
   - Acesse o subdomínio `cliente1.app.com` e verifique se a cor do botão primário corresponde à cor salva no banco de dados para esse tenant.
3. **Fluxo de Cadastro:** Simule um novo cliente se cadastrando, configurando a cor e fazendo o primeiro login.
4. **Ferramenta:** Use `Playwright` com `codegen` para gerar scripts rápidos.