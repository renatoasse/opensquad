---
task: redigir-denuncia
order: 3
agent: paula-penal
input: Todos os relatórios consolidados + instrução do usuário para oferecer denúncia
output: Denúncia criminal completa
---

## Process

1. Verificar justa causa: há indícios razoáveis de autoria e materialidade para cada acusado?
2. Para cada acusado, identificar as condutas específicas e tipificá-las legalmente
3. Estruturar a denúncia:
   a. Cabeçalho (vara, comarca, PIC → IP → Ação Penal)
   b. Qualificação de cada acusado (nome, CPF, endereço, profissão)
   c. Síntese narrativa dos fatos (cronológica, com datas, locais, valores)
   d. Descrição detalhada das condutas por acusado
   e. Tipificação legal para cada acusado (crime + qualificadoras + causas de aumento)
   f. Das provas (documentais: RIF, escrituras, extratos; periciais se houver; testemunhais)
   g. Rol de testemunhas (nome + endereço para intimação)
   h. Requerimentos: recebimento, citação, notificação de testemunhas, condenação
4. Verificar se a narrativa não inclui acusados sem indícios suficientes

**Tipos comuns de crimes relevantes para o GAECO:**
- Organização criminosa: art. 2°, Lei 12.850/2013 (pena 3-8 anos)
- Sonegação fiscal: art. 1°, Lei 8.137/1990 (pena 2-5 anos)
- Lavagem de dinheiro: art. 1°, Lei 9.613/1998 (pena 3-10 anos)
- Corrupção ativa/passiva: arts. 317/333, CP
- Crime contra o sistema financeiro: Lei 7.492/1986

## Output Format

```markdown
## Denúncia Criminal

EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO
DA __ VARA CRIMINAL DA COMARCA DE [cidade]/[estado]

O MINISTÉRIO PÚBLICO DO ESTADO DE [estado], pelo Promotor de Justiça signatário,
com atribuição junto ao GAECO, nos autos do Procedimento Investigatório Criminal n. X/AAAA,
vem oferecer

DENÚNCIA

em face de:

1. [Nome completo], [nacionalidade], [estado civil], [profissão], portador do CPF n. [X],
   residente e domiciliado em [endereço completo];
[demais acusados...]

I — DOS FATOS
[narrativa cronológica e detalhada]

II — DAS CONDUTAS DOS ACUSADOS
[por acusado]

III — DA TIPIFICAÇÃO PENAL
[por acusado]

IV — DAS PROVAS
[documentais, periciais, testemunhais]

V — DO ROL DE TESTEMUNHAS
[lista]

VI — DOS REQUERIMENTOS
[pedidos finais]
```

## Quality Criteria

- [ ] Justa causa verificada antes de incluir cada acusado
- [ ] Todos os acusados qualificados
- [ ] Fatos narrados com datas, locais e valores específicos
- [ ] Tipificação por acusado (incluindo qualificadoras/causas de aumento)
- [ ] Provas indicadas de forma discriminada
- [ ] Rol de testemunhas incluído

## Veto Conditions

- Acusado sem indícios suficientes incluído na denúncia → não incluir, informar usuário
- Fatos narrados genericamente sem datas/valores → refazer
- Sem tipificação legal → refazer
