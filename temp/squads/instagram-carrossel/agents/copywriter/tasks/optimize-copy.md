---
task: "Optimize Copy"
order: 2
input:
  - carousel_draft: output/carousel-draft.md (copy criado na tarefa create-slides.md)
  - tone_guide: pipeline/data/tone-of-voice.md
  - anti_patterns: pipeline/data/anti-patterns.md
  - examples: pipeline/data/output-examples.md
output:
  - optimized_copy: Copy otimizado com melhorias identificadas e aplicadas
  - optimization_log: Registro de todas as mudanças feitas e por quê
  - final_carousel_path: output/carousel-draft.md (atualizado)
---

# Optimize Copy

Revisa e otimiza o copy rascunho aplicando a checklist de qualidade e eliminando qualquer anti-padrão identificado. Garante que cada slide está no padrão máximo antes de ir para o design.

## Process

1. **Leitura crítica completa.** Ler o carousel-draft.md do início ao fim como se fosse um leitor do Instagram — sem saber o que vem a seguir. Anotar os pontos de perda de atenção, as frases que "travam", e as transições fracas.

2. **Aplicar os 6 Tone Rules como filtro.** Para cada slide, verificar:
   - Todo dado tem fonte identificável?
   - O contexto revelador está presente (não só o dado bruto)?
   - A lógica slide-a-slide está coerente?
   - A reflexão "toca na alma" de forma genuína?
   - Há copy vazias que podem ser cortadas sem perder sentido?
   - A linguagem é humana, não corporativa?

3. **Testar o hook com o scroll-stop test.** Reler o slide 1 como se estivesse scrollando o feed sem qualquer contexto sobre a Sem Codar. Se a resposta honesta for "eu continuaria scrollando", reescrever o hook. Esta é a melhoria mais crítica desta tarefa.

4. **Verificar anti-patterns.** Comparar cada slide com a lista em `pipeline/data/anti-patterns.md`. Marcar e corrigir qualquer padrão identificado.

5. **Otimizar transições entre slides.** Cada slide deve terminar com um micro-gancho que faz o leitor querer ver o próximo. Não precisa ser explícito ("veja no próximo slide") — pode ser uma pergunta aberta, um dado incompleto deliberadamente, ou uma implicação ainda não respondida.

6. **Revisar a legenda.** A abertura (primeiros 125 chars) deve ser forte o suficiente para que o leitor clique "ver mais". O corpo deve ser complementar ao carrossel, não repetitivo. Hashtags verificados: 5-8, todos relevantes para o nicho.

7. **Salvar versão otimizada e log.** Atualizar o carousel-draft.md com as melhorias aplicadas. Incluir um `optimization_log` ao final do documento com as mudanças feitas.

## Optimization Priority Order

1. Hook do slide 1 (maior impacto no engajamento)
2. Reflexão (impacto no save e share)
3. CTA (impacto em comentário e próxima ação)
4. Transições entre slides (impacto no tempo de retenção)
5. Qualidade dos dados e fontes (impacto em credibilidade)
6. Abertura da legenda (impacto em click "ver mais")

## Optimization Log Format

Adicionar ao final do carousel-draft.md:

```
---
## Optimization Log

### Mudanças Aplicadas
- [Slide X]: [O que mudou] → [Por que mudou]
- [Caption]: [O que mudou] → [Por que mudou]

### Anti-Patterns Corrigidos
- [Padrão identificado em qual slide] → [Como foi corrigido]

### Self-Assessment
- Scroll-stop test: PASS / FAIL (e justificativa)
- Reflexão presente: SIM / NÃO
- CTA específico: SIM / NÃO
- Todos os dados com fonte: SIM / NÃO (listar exceções)
```

## Quality Criteria

- [ ] Self-assessment mostra PASS em scroll-stop test
- [ ] Nenhum anti-pattern da lista ainda presente no output final
- [ ] Optimization log documenta todas as mudanças feitas
- [ ] Copy final é visivelmente melhor que o rascunho inicial — não apenas revisão superficial

## Note

Se o rascunho inicial já estiver em alto nível sem issues identificáveis, o log deve documentar isso explicitamente: "Nenhuma mudança significativa necessária — rascunho em nível de qualidade esperado." Não fabricar mudanças onde não existem.
