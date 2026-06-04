---
task: "Propose Visual Identities"
order: 1
input:
  - carousel_draft: output/carousel-draft.md (copy final dos slides — tom e conteúdo)
  - company_context: _opensquad/_memory/company.md
  - anti_patterns: pipeline/data/anti-patterns.md
output:
  - visual_identities: 3 propostas de identidade visual distintas (output/visual-identities.yaml)
---

# Propose Visual Identities

Antes de criar qualquer HTML ou imagem, propõe 3 identidades visuais distintas para o usuário escolher. Cada identidade é um sistema coeso: paleta de cores, tipografia e estilo visual que amplifica o tom do conteúdo.

## Process

1. **Ler o carousel-draft.md.** Identificar o tom emocional do conteúdo: é urgente? reflexivo? provocador? educacional? O design deve amplificar essa emoção, não contradizê-la.

2. **Criar 3 identidades visuais distintas.** Cada uma deve ter uma personalidade visual clara e diferente das outras. Regras:
   - Bold e colorido é o DNA do squad — nunca paleta corporativa genérica (azul + branco + cinza)
   - Cada identidade tem exatamente 1 cor de acento (não 2+)
   - As 3 identidades devem ser visivelmente distintas (não variações da mesma paleta)

3. **Para cada identidade, definir:**
   - **Nome**: identifica a proposta (ex: "Neon Night", "Solar Bold", "Deep Focus")
   - **Mood**: 2-3 palavras descrevendo a sensação visual (ex: "urgente e vibrante", "intelectual e sombrio")
   - **bg_color**: cor de fundo principal (hex)
   - **accent_color**: única cor de destaque (hex)
   - **font_family**: Inter ou Poppins
   - **font_weight_hero**: peso da fonte hero (900 recomendado)
   - **preview_description**: como vai parecer na prática (2-3 linhas descritivas)

4. **Indicar a identidade recomendada** com justificativa baseada no tom do conteúdo.

5. **Salvar em `output/visual-identities.yaml`.**

## Paletas de Referência (ponto de partida, não limite)

- **Deep Navy + Coral**: bg #0A0E1A, accent #FF4757 — urgente, tech, moderno
- **Preto + Electric Blue**: bg #0D0D0D, accent #1E90FF — frio, analítico, autoridade
- **Deep Purple + Neon Green**: bg #1A0A2E, accent #00FF88 — criativo, inovador, futuro
- **Dark Forest + Amarelo Ouro**: bg #0A1A0A, accent #FFD700 — premium, confiante, estabelecido
- **Carvão + Laranja Vibrante**: bg #1A1A1A, accent #FF6B35 — energético, acionável, motivacional

## Output Format

```yaml
content_tone: "Tom emocional identificado no conteúdo"

identities:
  - id: 1
    name: "Nome da identidade"
    mood: "Adjetivos que descrevem a sensação visual"
    bg_color: "#0A0E1A"
    accent_color: "#FF4757"
    secondary_text_color: "#AAAAAA"
    font_family: "Inter"
    font_weight_hero: 900
    preview_description: |
      Fundo escuro navy profundo. Dados e números em coral elétrico com máximo contraste.
      Texto branco puro no corpo. Sensação de urgência tech — parece um dashboard de métricas.
      Slide de reflexão usa accent com 10% opacity como fundo alternativo.

  - id: 2
    name: "..."

  - id: 3
    name: "..."

recommended_identity: 1
recommendation_reason: "Por que esta identidade amplifica melhor o tom do conteúdo"
```

## Quality Criteria

- [ ] Exatamente 3 identidades propostas
- [ ] As 3 são visivelmente distintas (paletas, não variações)
- [ ] Nenhuma usa paleta genérica corporate (azul claro + branco + cinza)
- [ ] Cada identidade tem exatamente 1 accent_color
- [ ] preview_description é descritiva o suficiente para o usuário visualizar sem ver a imagem
- [ ] Identidade recomendada tem justificativa baseada no tom do conteúdo

## Veto Conditions

Rejeitar e refazer se:
1. Duas identidades são variações da mesma paleta (ex: dois tons de azul escuro)
2. Alguma identidade usa mais de 1 accent_color
3. preview_description é vaga ("visual bonito" não é aceitável)
