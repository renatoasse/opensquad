# Referências de imagem do mascote — capa e fechamento

Esta pasta deve conter as **imagens do mascote** (corvo/gralha 3D) para uso como fundo ou elemento visual nas **capas** e **slides de fechamento** dos carrosséis.

## Nomes dos arquivos (por reação)

Use exatamente estes nomes para o agente poder selecionar pela reação:

| Arquivo | Reação | Uso sugerido |
|---------|--------|--------------|
| `mascote_estressado.png` | Estresse, pânico, código/depuração | Capa: problema, desafio, "erro" |
| `mascote_alegre.png` | Alegre, sorridente, acolhedor | Capa/fechamento: positividade, CTA amigável |
| `mascote_perplexo.png` | Perplexo, confuso, análise complexa | Capa: dúvida, dados, análise |
| `mascote_nervoso.png` | Nervoso, preocupado, entrevista | Capa: pressão, expectativa, carreira |
| `mascote_analitico.png` | Sério, focado, revisor | Capa/fechamento: insight, conclusão, dados |
| `mascote_pensativo.png` | Pensativo, reflexão, café | Capa/fechamento: reflexão, decisão, “pensar” |
| `mascote_surpreso.png` | Surpreso, susto, “oh-oh” | Capa: revelação, erro, momento inesperado |

## Como preencher esta pasta

**Opção A — Script (quando as imagens estão numa pasta com nomes do Cursor):**  
Execute na pasta onde estão as 7 imagens (ex.: assets do workspace) ou passe a pasta como parâmetro:

```powershell
cd "d:\projetos\Estudo\opensquad\squads\insta-mvp\pipeline\data\mascote-references"
.\copy-and-rename-mascote.ps1 -Source "C:\Users\...\assets"
```

O script mapeia pelos nomes originais: `*__1_*` → estressado, `*__2_*` → alegre, `*__3_*` → perplexo, `*__4_*` → nervoso, `*__5_*` → analítico, `*__6_*` → pensativo, `*cdfa9644*` → surpreso.

**Opção B — Manual:**  
1. Copie as 7 imagens do mascote para esta pasta.  
2. Renomeie cada uma conforme a tabela acima (ex.: a imagem do mascote sorrindo → `mascote_alegre.png`).  
3. O agente (Diana) usa o guia `mascote-reference-guide.md` para escolher o arquivo certo conforme o contexto do carrossel.

## Formato

- PNG com fundo (roxo MVP Flow ou transparente, conforme o asset).
- Resolução adequada para 1080x1440 (slide Instagram); o designer pode redimensionar ou recortar.
