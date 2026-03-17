---
type: checkpoint
---

# Step 11: Aprovação de conteúdo

## Contexto

Renata Revisão entregou o veredito em `squads/insta-mvp/output/{run_id}/review.md`. O usuário deve aprovar o conteúdo (carrossel + legenda) antes do design e da publicação.

## Instruções

1. Ler review.md (veredito, summary, required_changes, suggestions).
2. Se REJECT: informar o usuário e perguntar se deseja corrigir (voltar ao step 08 ou 09) ou cancelar. Se APPROVE ou CONDITIONAL: apresentar resumo e preview (slides + legenda).
3. Pedir confirmação: "Aprovar conteúdo para seguir para o design e publicação? (1. Sim / 2. Não, quero corrigir)"
4. Se Sim: seguir para step 12 (Diana Design). Se Não: voltar ao step apropriado (Carla ou Sérgio).

## Output

Escolha do usuário. Runner atualiza estado e avança para step-12 ou retorna a step-08/09.
