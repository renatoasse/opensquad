# Guia de seleção do mascote — capa e fechamento do carrossel

**Uso:** O designer (Diana) ou um agente de seleção deve ler este guia e o **contexto do carrossel** (tema, ângulo, tom, capa vs fechamento) para escolher a **melhor imagem do mascote** para fundo ou destaque na capa ou no slide de fechamento.

As imagens ficam em `squads/insta-mvp/pipeline/data/mascote-references/` com nomes por reação (ex.: `mascote_alegre.png`).

---

## Tabela de reações e quando usar

| Arquivo | Expressão do mascote | Melhor para capa | Melhor para fechamento | Tom do conteúdo |
|---------|----------------------|-------------------|-------------------------|-----------------|
| `mascote_estressado.png` | Estresse, pânico; código na tela, suor | Sim: quando o gancho é problema, bug, “erro”, desafio técnico | Raro | Provocador, problema/solução |
| `mascote_alegre.png` | Alegre, sorridente, óculos, fundo roxo | Sim: tema positivo, oportunidade, “você pode” | **Sim:** CTA amigável, convite, encerramento positivo | Inspirador, acolhedor |
| `mascote_perplexo.png` | Perplexo; segurando “QUARTERLY ANALYSIS” | Sim: dúvida, análise de dados, decisão complexa | Possível: conclusão que gera “e agora?” | Analítico, reflexivo |
| `mascote_nervoso.png` | Nervoso, preocupado; entrevista, prancheta | Sim: carreira, entrevista, pressão, expectativa | Possível: “supere o medo” | Provocador, tensão |
| `mascote_analitico.png` | Sério, focado; relatório/análise | Sim: dados, revisão, insight sério | **Sim:** conclusão forte, “o que aprendemos” | Editorial, sério |
| `mascote_pensativo.png` | Pensativo, caneca de café; reflexão | Sim: reflexão, “vale a pena?”, decisão | **Sim:** “pense nisso”, chamada à reflexão | Reflexivo, estratégico |
| `mascote_surpreso.png` | Surpreso, susto; balde derramando | Sim: revelação, “erro que você comete”, inesperado | Raro | Provocador, humor |

---

## Regras para o agente analisar e escolher

1. **Capa (slide 1)**  
   - Leia o **título da capa** e o **ângulo/tom** do carrossel (ex.: provocador, oportunidade, analítico).  
   - Se o gancho for **problema / erro / desafio** → preferir `mascote_estressado` ou `mascote_surpreso`.  
   - Se for **oportunidade / positividade** → preferir `mascote_alegre` ou `mascote_pensativo`.  
   - Se for **dados / análise / decisão** → preferir `mascote_analitico` ou `mascote_perplexo`.  
   - Se for **carreira / pressão / entrevista** → preferir `mascote_nervoso`.

2. **Fechamento (último slide)**  
   - Leia o **CTA** e o tom do encerramento.  
   - CTA **amigável / convite** → `mascote_alegre`.  
   - CTA **reflexivo / “pense nisso”** → `mascote_pensativo`.  
   - Conclusão **séria / insight** → `mascote_analitico`.  
   - Evitar na finalização: estressado, surpreso, nervoso (a menos que o CTA seja “supere o medo” ou similar).

3. **Só uma imagem por carrossel**  
   - Use o mascote **ou na capa ou no fechamento**, não obrigatório nos dois. Se usar nos dois, manter a mesma reação ou combinar alegre (fechamento) + outra (capa) quando fizer sentido.

4. **Saída do agente**  
   - Retornar: `mascote_escolhido: "mascote_XXXXX.png"` e `onde: "capa" | "fechamento"` e uma frase de justificativa (ex.: “Capa com gancho de problema; mascote_estressado reforça a dor.”).

---

## Referência rápida por palavra‑chave

- **erro / bug / susto / problema** → estressado ou surpreso  
- **alegre / positivo / convite / CTA** → alegre  
- **dúvida / análise / dados / relatório** → analítico ou perplexo  
- **carreira / entrevista / pressão** → nervoso  
- **reflexão / decisão / café / pensar** → pensativo  
- **revelação / inesperado** → surpreso  

---

## Integração no pipeline

- **Step 12 (Diana):** ao montar a capa ou o slide de fechamento, ler este guia e o `carousel-draft.md` (título, ângulo, tom). Escolher o arquivo em `mascote-references/` conforme as regras acima e usar como imagem de fundo ou cutout (conforme design-system: coluna direita ou base, sem cobrir o texto principal).
- **Opcional:** um agente “Seletor de mascote” pode rodar antes do step 12: recebe o carousel-draft, devolve `mascote_escolhido` + `onde` + justificativa e a Diana usa esse resultado.
