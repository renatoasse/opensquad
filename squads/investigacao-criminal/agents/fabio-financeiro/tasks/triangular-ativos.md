---
task: triangular-ativos
order: 2
agent: fabio-financeiro
input: Task 1 (renda declarada) + relatório OSINT (bens identificados) + relatório documental
output: Análise de incompatibilidade patrimonial e estruturas de blindagem
---

## Process

1. Para cada investigado: compilar todos os bens identificados (imóveis, veículos, participações, bens de luxo do OSINT)
2. Calcular patrimônio real total identificado (soma de todos os bens com valores estimados)
3. Calcular incompatibilidade: Patrimônio Real - Renda Acumulada Estimada (após impostos e custo de vida)
4. Identificar estruturas de blindagem patrimonial:
   - Bens em nome de laranjas (cruzar com mapa de redes)
   - Empresas de fachada (comparar faturamento declarado vs. movimentação no RIF)
   - Alienações suspeitas (transferências de bens próximas a investigações ou deflagrações)
   - Participações societárias suspeitas
5. Para cada bem identificado: avaliar se é passível de constrição judicial (SISBAJUD, RENAJUD, arresto)
6. Identificar os crimes tributários/financeiros suspeitos (lavagem, sonegação, evasão)

## Output Format

```yaml
investigado: "[Nome]"
patrimonio_real_total:
  imóveis: "R$ X"
  veiculos: "R$ X"
  participacoes: "R$ X (a quantificar)"
  bens_luxo: "R$ X"
  total_estimado: "R$ X"
renda_acumulada_disponivel: "R$ X"
incompatibilidade: "R$ X"
estruturas_suspeitas:
  - tipo: "[Empresa fachada/Laranja/Alienação suspeita/etc]"
    descricao: "[descrição]"
    evidencias: "[fonte]"
bens_para_constricao:
  - descricao: "[bem]"
    valor: "R$ X"
    titular_formal: "[nome]"
    medida_cabivel: "[SISBAJUD/RENAJUD/Arresto]"
crimes_suspeitos:
  - "[Lavagem de dinheiro — art. 1º, Lei 9.613/1998]"
  - "[Sonegação fiscal — art. 1º, Lei 8.137/1990]"
```

## Quality Criteria

- [ ] Patrimônio real calculado com valores estimados
- [ ] Incompatibilidade quantificada em reais
- [ ] Estruturas de blindagem identificadas com critérios objetivos
- [ ] Bens passíveis de constrição listados com medida cabível
- [ ] Crimes tributários/financeiros suspeitos identificados

## Veto Conditions

- Incompatibilidade não quantificada → refazer
- Empresa de fachada identificada sem critérios documentados → refazer
