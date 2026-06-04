# Design: Tom de Voz por Conteúdo

**Data**: 2026-02-24
**Status**: Aprovado

## Problema

O agente copywriter (Quill) no squad de Instagram — e agentes escritores de conteúdo em geral — produzem conteúdo sem perguntar ao usuário qual tom de voz utilizar. O tom deveria ser escolhido a cada execução, pois diferentes conteúdos pedem tons diferentes.

## Solução

### 1. Novo arquivo de dados: `tone-of-voice.md`

**Localização no template Instagram**: `pipeline/data/tone-of-voice.md`

Arquivo com 6 tons de voz padrão:

| Tom | Descrição | Quando usar |
|-----|-----------|-------------|
| **Educativo** | Ensina algo útil, direto ao ponto, didático | Tutoriais, dicas, frameworks, how-to |
| **Provocativo** | Desafia crenças, gera debate, polêmico | Opiniões fortes, mitos, contraponto |
| **Inspiracional** | Motiva ação, storytelling, emocional | Cases, jornadas, transformações |
| **Humorístico** | Leve, divertido, usa memes e referências | Trends, conteúdo viral, engajamento |
| **Autoridade** | Especialista, dados, credibilidade técnica | Pesquisas, resultados, prova social |
| **Conversacional** | Como uma conversa entre amigos, informal | Bastidores, perguntas, comunidade |

### 2. Mudança no step-04 (Writing) do template Instagram

O prompt do Quill ganha instrução para, **antes de escrever qualquer conteúdo**:

1. Ler `tone-of-voice.md`
2. Analisar o tema/ideia escolhida pelo usuário
3. Recomendar o tom mais adequado com justificativa curta
4. Apresentar todas as opções numeradas
5. Aguardar a escolha do usuário
6. Só então escrever o carousel usando o tom escolhido

O tom escolhido deve permear todo o conteúdo: hook, slides, CTA.

### 3. Mudança no arquiteto (Atlas)

Quando Atlas cria um squad de **produção de conteúdo** (escrita, copy, posts, artigos), ele deve:

1. Gerar automaticamente o arquivo `pipeline/data/tone-of-voice.md` com os tons padrão
2. Incluir no agente escritor/copywriter a instrução de perguntar o tom antes de produzir

A detecção de squad de conteúdo é por tipo de trabalho (presença de agentes escritores/copywriters/redatores).

## Escopo

- **Template Instagram**: Adicionar `tone-of-voice.md` + modificar step-04
- **Arquiteto (Atlas)**: Modificar lógica de geração de squads de conteúdo

## Princípios

- Tom é escolhido **por conteúdo**, não globalmente
- Recomendação é **dinâmica**, baseada no tema/pesquisa
- Arquivo de tons é **editável** pelo usuário
- YAGNI: 6 tons padrão, sem overengineering
