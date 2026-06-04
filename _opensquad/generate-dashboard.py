#!/usr/bin/env python3
"""Generate dashboard.html from state.json data + static config."""

import json, os, re, glob
from datetime import datetime, timezone

BASE = "/home/alinedeolivgs/🧩DEV/💡equipe aline_dev"

SQUADS = [
    {
        "dir": "criador-de-conteudo",
        "name": "Criador de Conteúdo",
        "icon": "🎨",
        "group": "Growth",
        "schedule": "Ter/Qui 09h",
        "agents": [
            ("ricardo-rastreador", "Ricardo Rastreador", "🔍", "Estrategista de Tendências"),
            ("leo-logica", "Léo Lógica", "🧠", "Mentor de Negócios & Estrategista"),
            ("teresa-tendencias", "Teresa Tendências", "🔮", "Estrategista de Tendências"),
            ("elias-estrategia", "Elias Estratégia", "🎯", "Estrategista de Conteúdo"),
            ("aurora-autoridade", "Aurora Autoridade", "🌟", "Copywriter de Autoridade"),
            ("lucia-linkedin", "Lúcia LinkedIn", "✍️", "Copywriter LinkedIn"),
            ("tulio-tuites", "Túlio Tuítes", "🐦", "Ghostwriter Twitter/X"),
            ("caio-copy", "Caio Copy", "✍️", "Senior Copywriter"),
            ("daniel-design", "Daniel Design", "🎨", "Diretor de Arte Visual"),
            ("vera-veredito", "Vera Veredito", "⚖️", "Editora-Chefe & Revisora"),
            ("sofia-social", "Sofia Social", "📣", "Social Media Manager"),
            ("georgia-gerente", "Geórgia Gerente", "📊", "Growth & Relatórios + FinOps"),
        ],
        "pipeline": [
            "📥 Pesquisa", "🧠 Diagnóstico", "📈 Tendências", "🎯 Estratégia", "🌟 Autoridade",
            "✍️ Copy", "🐦 Threads", "📝 Copy Geral", "🎨 Design", "⚖️ Revisão",
            "📣 Publicação", "📊 Relatório Growth", "📊 Relatório FinOps"
        ]
    },
    {
        "dir": "prospeccao-b2b-sp",
        "name": "Prospecção B2B SP",
        "icon": "🔍",
        "group": "Prospecção",
        "schedule": "Sex 09h",
        "agents": [
            ("tati-tracker", "Tati Tracker", "📡", "Tracker de Leads"),
            ("leo-logica", "Léo Lógica", "🧠", "Analista de Diagnóstico"),
            ("caio-copy", "Caio Copy", "✍️", "Copywriter de Abordagem"),
            ("natan-negociador", "Natan Negociador", "🤝", "Negociador B2B"),
            ("marcelo-validador", "Marcelo Validador", "✅", "Validador de Fit"),
            ("georgia-gerente", "Geórgia Gerente", "📊", "Relatórios + FinOps"),
        ],
        "pipeline": [
            "📡 Extração", "✅ Validação", "🧠 Diagnóstico", "✍️ Copy",
            "🤝 Oferta", "🔍 Revisão", "🚀 Setup", "✅ Aprovação", "📊 Relatório"
        ]
    },
    {
        "dir": "vendas-lucrativas",
        "name": "Vendas Lucrativas",
        "icon": "💰",
        "group": "Vendas",
        "schedule": "Seg 20h",
        "agents": [
            ("barbara-fechamento", "Barbara Fechamento", "⚡", "Fechamento Rápido"),
            ("leandro-estrategista", "Leandro Funil", "🔄", "Estrategista de Funil"),
            ("eleonora-sdr", "Eleonora SDR", "🔍", "SDR de Triagem"),
            ("jose-closer", "José Closer", "🎯", "Fechador High-Ticket"),
            ("flavio-fechador", "Flávio Fechador", "🔥", "Vendedor Visionário"),
            ("gustavo-gestor", "Gustavo Gestor", "🤝", "Gestor de Afiliados"),
            ("georgia-gerente", "Geórgia Gerente", "📊", "Relatórios + FinOps"),
        ],
        "pipeline": [
            "⚡ Fechamento", "🔄 Funil", "🔍 SDR", "🎯 Closer",
            "🔥 Vendas", "🤝 Afiliados", "📊 Relatório"
        ]
    },
    {
        "dir": "express-onboarding-aline-dev",
        "name": "Onboarding VIP",
        "icon": "🚀",
        "group": "Onboarding",
        "schedule": "On-demand (Hotmart)",
        "agents": [
            ("kevin-keeper", "Kevin Keeper", "🎩", "Atendimento VIP"),
            ("helena-eng", "Helena Eng", "⚙️", "Engenheira Onboarding"),
            ("anderson-arch", "Anderson Arch", "📐", "Arquiteto Onboarding"),
            ("gael-auditor", "Gael Auditor", "🛡️", "Auditor Segurança"),
        ],
        "pipeline": [
            "🔥 Webhook", "🎩 Boas-Vindas", "⚙️ Marketplace",
            "📐 Engine Config", "🛡️ Segurança"
        ]
    },
    {
        "dir": "sucesso-retencao-aline-dev",
        "name": "Sucesso e Retenção",
        "icon": "🔒",
        "group": "Suporte",
        "schedule": "Seg 10h",
        "agents": [
            ("kelly-qa", "Kelly QA", "✅", "QA Contínuo"),
            ("alex-auditor", "Alex Auditor", "⚡", "Auditor Performance"),
            ("ravi-suporte", "Ravi Suporte", "🛡️", "Defensor dos Termos"),
            ("celina-cs", "Celina CS", "💎", "CS High-Ticket"),
            ("ronaldo-analista-roi", "Ronaldo ROI", "📈", "Analista de ROI"),
            ("gael-killswitch", "Gael Kill-Switch", "🔒", "Sentinela Cobrança"),
            ("lavinis-estrategista", "Lavínis Expansão", "🚀", "Estrategista Expansão"),
            ("maite-concierge", "Maitê Concierge", "🤝", "Concierge Fidelidade"),
            ("georgia-gerente", "Geórgia Gerente", "📊", "Relatórios + FinOps"),
        ],
        "pipeline": [
            "✅ QA", "⚡ Performance", "🛡️ Suporte", "💎 CS",
            "📈 ROI", "🔒 Kill-Switch", "🚀 Expansão", "🤝 Concierge", "📊 Relatório"
        ]
    },
    {
        "dir": "blueprint-to-sale",
        "name": "Blueprint-to-Sale",
        "icon": "🏭",
        "group": "Fábrica",
        "schedule": "On-demand",
        "agents": [
            ("samuel-estrategista", "Samuel Estrategista", "🧠", "Sage — Estratégia"),
            ("flavia-full-stack", "Flávia Full-Stack", "🔨", "Forge — Desenvolvimento"),
            ("allan-devops", "Allan DevOps", "🗺️", "Atlas — GitHub/Deploy"),
            ("eduardo-email", "Eduardo Email", "📨", "Mercury — Email Marketing"),
            ("otavio-followup", "Otávio Follow-up", "🔮", "Oracle — Follow-up"),
            ("paulo-posvenda", "Paulo Pós-Venda", "🔑", "Keeper — Entrega"),
            ("miguel-sdr", "Miguel SDR", "🎯", "SDR de Templates"),
            ("theo-closer", "Théo Closer", "💎", "Closer High-Ticket"),
            ("alicia-afiliados", "Alicia Afiliados", "🤝", "Recrutadora Afiliados"),
            ("luan-boilerplate", "Luan Boilerplates", "🔧", "Engenheiro Boilerplates"),
            ("isabela-designer", "Isabela Designer", "🎨", "Designer Assets"),
            ("icaro-instigador", "Ícaro Instigador", "🔥", "Copywriter Persuasivo"),
            ("lara-logistica", "Lara Logística", "📋", "Estrategista Logística"),
            ("renata-requinte", "Renata Requinte", "✨", "Designer Visual Premium"),
            ("georgia-gerente", "Geórgia Gerente", "📊", "Relatórios + FinOps"),
        ],
        "pipeline": [
            "🧠 Análise", "🔨 Desenvolvimento", "🗺️ GitHub", "📨 Oferta",
            "🔮 Follow-up", "🔑 Entrega", "🎯 SDR", "💎 Upsell",
            "🤝 Afiliados", "🔧 Boilerplate", "🎨 Assets", "📊 Relatório"
        ]
    }
]

LLM_ROUTES = {}
routing_path = os.path.join(BASE, "squads", "llm-routing.yaml")
if os.path.exists(routing_path):
    with open(routing_path) as f:
        for line in f:
            m = re.match(r'^\s*-\s*id:\s*(\S+)', line)
            if m:
                current_id = m.group(1)
            m = re.match(r'^\s*llm:\s*(\S+)', line)
            if m and current_id:
                LLM_ROUTES[current_id] = m.group(1)

def get_latest_state(squad_dir):
    out_dir = os.path.join(BASE, "squads", squad_dir, "output")
    if not os.path.isdir(out_dir):
        return None
    runs = sorted([d for d in os.listdir(out_dir) if os.path.isdir(os.path.join(out_dir, d))], reverse=True)
    for run_id in runs:
        state_path = os.path.join(out_dir, run_id, "state.json")
        if os.path.exists(state_path):
            try:
                with open(state_path) as f:
                    return json.load(f)
            except json.JSONDecodeError:
                continue
    return None

def build_squad_js(sq, state):
    if state:
        status = state.get("status", "idle")
        step_info = state.get("step", {"current": 0, "total": len(sq["pipeline"]), "label": ""})
    else:
        status = "idle"
        step_info = {"current": 0, "total": len(sq["pipeline"]), "label": ""}

    # determine agent statuses from state
    agent_statuses = {}
    if state:
        for a in state.get("agents", []):
            agent_statuses[a["id"]] = a["status"]

    agents_js = []
    for aid, aname, aicon, arole in sq["agents"]:
        astatus = agent_statuses.get(aid, "idle")
        llm = LLM_ROUTES.get(aid, "claude")
        agents_js.append(
            f'{{name:"{aname}",icon:"{aicon}",status:"{astatus}",role:"{arole}",llm:"{llm}",id:"{aid}"}}'
        )

    return f"""
  {{
    id: '{sq["dir"]}',
    name: '{sq["name"]}',
    icon: '{sq["icon"]}',
    group: '{sq["group"]}',
    schedule: '{sq["schedule"]}',
    status: '{status}',
    step: {{ current: {step_info["current"]}, total: {step_info["total"]}, label: '{step_info["label"]}' }},
    agents: [{",".join(agents_js)}],
    pipeline: [{",".join(f'"{s}"' for s in sq["pipeline"])}]
  }}"""

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Command Center — equipe_Aline Dev</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0a0a0f;color:#e2e8f0;font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:#0a0a0f}
  ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px}
  ::-webkit-scrollbar-thumb:hover{background:#334155}
  .header{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-bottom:1px solid rgba(99,102,241,.2);padding:16px 32px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;backdrop-filter:blur(20px)}
  .header-left{display:flex;align-items:center;gap:16px}
  .logo{width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff}
  .header h1{font-size:18px;font-weight:700;background:linear-gradient(135deg,#e2e8f0,#94a3b8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .header-sub{font-size:12px;color:#64748b;font-weight:400;-webkit-text-fill-color:#64748b}
  .header-right{display:flex;align-items:center;gap:24px}
  .status-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px}
  .status-dot.online{background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,.5)}
  .status-dot.offline{background:#ef4444;box-shadow:0 0 8px rgba(239,68,68,.5)}
  .header-stat{font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:4px}
  .container{max-width:1440px;margin:0 auto;padding:24px 32px}
  .stats-bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px}
  .stat-card{background:linear-gradient(135deg,rgba(15,23,42,.8),rgba(30,41,59,.8));border:1px solid rgba(99,102,241,.15);border-radius:12px;padding:20px;backdrop-filter:blur(10px);transition:all .3s}
  .stat-card:hover{border-color:rgba(99,102,241,.3);transform:translateY(-2px)}
  .stat-label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:8px}
  .stat-value{font-size:28px;font-weight:800;color:#e2e8f0}
  .stat-sub{font-size:12px;color:#64748b;margin-top:4px}
  .section-title{font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;margin:32px 0 16px;display:flex;align-items:center;gap:8px}
  .section-title::before{content:'';display:block;width:3px;height:16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:2px}
  .squad-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:20px;margin-bottom:32px}
  .squad-card{background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(30,41,59,.9));border:1px solid rgba(99,102,241,.12);border-radius:16px;padding:0;overflow:hidden;backdrop-filter:blur(10px);transition:all .3s}
  .squad-card:hover{border-color:rgba(99,102,241,.25);transform:translateY(-2px);box-shadow:0 8px 32px rgba(99,102,241,.1)}
  .squad-header{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(99,102,241,.1)}
  .squad-name{font-size:14px;font-weight:600;color:#e2e8f0;display:flex;align-items:center;gap:8px}
  .squad-badge{font-size:10px;padding:2px 8px;border-radius:6px;font-weight:500;text-transform:uppercase;letter-spacing:.5px}
  .badge-idle{background:rgba(100,116,139,.2);color:#94a3b8;border:1px solid rgba(100,116,139,.3)}
  .badge-running{background:rgba(34,197,94,.15);color:#22c55e;border:1px solid rgba(34,197,94,.3);animation:pulse 2s infinite}
  .badge-completed{background:rgba(99,102,241,.15);color:#818cf8;border:1px solid rgba(99,102,241,.3)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
  .squad-body{padding:16px 20px}
  .squad-meta{display:flex;gap:16px;margin-bottom:12px;font-size:12px;color:#94a3b8}
  .squad-meta span{display:flex;align-items:center;gap:4px}
  .agent-mini-grid{display:flex;flex-wrap:wrap;gap:6px}
  .agent-mini{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;border:1px solid rgba(100,116,139,.2);position:relative;cursor:pointer;transition:all .2s}
  .agent-mini:hover{transform:scale(1.15);z-index:10}
  .agent-mini.done{background:rgba(99,102,241,.15);border-color:rgba(99,102,241,.3)}
  .agent-mini.working{background:rgba(34,197,94,.2);border-color:rgba(34,197,94,.5);box-shadow:0 0 12px rgba(34,197,94,.3)}
  .agent-mini.idle{background:rgba(15,23,42,.5);border-color:rgba(100,116,139,.15)}
  .agent-mini .tooltip{visibility:hidden;opacity:0;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#1e293b;color:#e2e8f0;padding:6px 10px;border-radius:6px;font-size:11px;white-space:nowrap;border:1px solid rgba(99,102,241,.2);transition:all .2s;z-index:20;pointer-events:none}
  .agent-mini:hover .tooltip{visibility:visible;opacity:1}
  .agent-mini .tooltip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1e293b}
  .pipeline-flow{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:12px;padding:12px;background:rgba(0,0,0,.3);border-radius:8px}
  .step-pill{font-size:10px;padding:3px 8px;border-radius:4px;background:rgba(100,116,139,.15);color:#64748b;white-space:nowrap}
  .step-pill.current{background:rgba(99,102,241,.2);color:#818cf8;border:1px solid rgba(99,102,241,.3)}
  .step-pill.done{background:rgba(34,197,94,.15);color:#22c55e}
  .step-arrow{color:#334155;font-size:10px}
  .modal-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);z-index:200;align-items:center;justify-content:center}
  .modal-overlay.active{display:flex}
  .modal{background:linear-gradient(135deg,#0f172a,#1e293b);border:1px solid rgba(99,102,241,.2);border-radius:16px;padding:24px;max-width:400px;width:90%;max-height:80vh;overflow-y:auto}
  .modal h2{font-size:18px;margin-bottom:4px;display:flex;align-items:center;gap:8px}
  .modal .role{font-size:12px;color:#64748b;margin-bottom:12px}
  .modal .detail{font-size:13px;color:#94a3b8;margin-bottom:6px;display:flex;gap:8px}
  .modal .detail strong{color:#e2e8f0;min-width:80px}
  .modal-close{background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3);padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px;margin-top:12px;width:100%}
  .integ-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:32px}
  .integ-card{background:linear-gradient(135deg,rgba(15,23,42,.8),rgba(30,41,59,.8));border:1px solid rgba(99,102,241,.12);border-radius:12px;padding:20px;transition:all .3s}
  .integ-card:hover{border-color:rgba(99,102,241,.25)}
  .integ-icon{font-size:24px;margin-bottom:8px}
  .integ-name{font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:4px}
  .integ-status{font-size:11px;display:flex;align-items:center;gap:6px}
  .integ-meta{font-size:11px;color:#64748b;margin-top:4px}
  .finops-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-bottom:32px}
  .finops-card{background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(30,41,59,.9));border:1px solid rgba(99,102,241,.12);border-radius:12px;padding:20px}
  .finops-bar{height:8px;background:rgba(100,116,139,.2);border-radius:4px;margin:8px 0;overflow:hidden}
  .finops-fill{height:100%;border-radius:4px;transition:width 1s ease}
  .finops-fill.safe{background:linear-gradient(90deg,#22c55e,#16a34a)}
  .finops-fill.warn{background:linear-gradient(90deg,#eab308,#ca8a04)}
  .finops-fill.danger{background:linear-gradient(90deg,#ef4444,#dc2626)}
  .finops-label{display:flex;justify-content:space-between;font-size:12px;color:#94a3b8;margin-bottom:4px}
  .goal-section{background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(30,41,59,.9));border:1px solid rgba(99,102,241,.12);border-radius:16px;padding:24px;margin-bottom:32px}
  .goal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  .goal-title{font-size:14px;font-weight:600;color:#e2e8f0}
  .goal-progress{font-size:28px;font-weight:800;color:#818cf8}
  .goal-bar{height:12px;background:rgba(100,116,139,.2);border-radius:6px;overflow:hidden}
  .goal-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,#6366f1,#8b5cf6);transition:width 1s ease}
  .goal-markers{display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-top:6px}
  .goal-months{display:flex;justify-content:space-between;font-size:10px;color:#475569;margin-top:4px}
  .footer{text-align:center;padding:24px;font-size:11px;color:#475569;border-top:1px solid rgba(99,102,241,.1)}
  .footer a{color:#6366f1;text-decoration:none;cursor:pointer}
  .footer a:hover{color:#818cf8}
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <div class="logo">AD</div>
    <div>
      <h1>Command Center</h1>
      <div class="header-sub">equipe_Aline Dev · OpenSquad</div>
    </div>
  </div>
  <div class="header-right">
    <span class="header-stat"><span class="status-dot online"></span><span id="totalAgents">53 Agentes</span></span>
    <span class="header-stat">🔄 <span id="lastUpdate">--</span></span>
  </div>
</div>

<div class="container">

  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-label">Total Squads</div>
      <div class="stat-value">6</div>
      <div class="stat-sub">100% operacionais</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Agentes</div>
      <div class="stat-value" id="statAgents">53</div>
      <div class="stat-sub"><span id="statActive">0</span> ativos nesta semana</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">LLMs</div>
      <div class="stat-value">7</div>
      <div class="stat-sub">Claude · OpenAI · Gemini · DeepSeek · Qwen · Kimi · Ollama</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Meta High-Ticket</div>
      <div class="stat-value" id="statGoal">0</div>
      <div class="stat-sub">de 52 clientes (R$ 7.100 + R$ 520/mês)</div>
    </div>
  </div>

  <div class="section-title">Squads & Agentes</div>
  <div class="squad-grid" id="squadGrid"></div>

  <div class="section-title">Fluxo de Pipeline</div>
  <div class="squad-grid" id="pipelineGrid"></div>

  <div class="section-title">Conectividade</div>
  <div class="integ-grid">
    <div class="integ-card">
      <div class="integ-icon">🔥</div>
      <div class="integ-name">Hotmart</div>
      <div class="integ-status"><span class="status-dot online"></span>Webhook Ativo</div>
      <div class="integ-meta">Notificações de pagamento · Onboarding VIP</div>
    </div>
    <div class="integ-card">
      <div class="integ-icon">🗄️</div>
      <div class="integ-name">Firestore</div>
      <div class="integ-status"><span class="status-dot online"></span>Conectado</div>
      <div class="integ-meta">Coleção: blueprints · webhooks</div>
    </div>
    <div class="integ-card">
      <div class="integ-icon">✈️</div>
      <div class="integ-name">Telegram</div>
      <div class="integ-status"><span class="status-dot online"></span>Bridge Ativa</div>
      <div class="integ-meta">6 grupos · 30+ tópicos</div>
    </div>
    <div class="integ-card">
      <div class="integ-icon">💻</div>
      <div class="integ-name">Infraestrutura</div>
      <div class="integ-status"><span class="status-dot online"></span>PC Local</div>
      <div class="integ-meta">Migração futura: VPS Hostinger + n8n</div>
    </div>
    <div class="integ-card">
      <div class="integ-icon">🤖</div>
      <div class="integ-name">LLMs</div>
      <div class="integ-status"><span class="status-dot online"></span>7 Modelos</div>
      <div class="integ-meta">Claude · OpenAI · Gemini · DeepSeek · Qwen · Kimi · Ollama</div>
    </div>
    <div class="integ-card">
      <div class="integ-icon">📊</div>
      <div class="integ-name">Geórgia FinOps</div>
      <div class="integ-status"><span class="status-dot online"></span>Monitorando</div>
      <div class="integ-meta">Alerta de tokens > R$ 520/mês</div>
    </div>
  </div>

  <div class="section-title">Monitoramento FinOps</div>
  <div class="finops-grid" id="finopsGrid">
    <div class="finops-card">
      <div class="finops-label"><span>OpenAI</span><span>R$ 0 / R$ 520</span></div>
      <div class="finops-bar"><div class="finops-fill safe" style="width:0%"></div></div>
      <div style="font-size:11px;color:#64748b;margin-top:4px">7 agentes · Flávia · Allan · Luan · Helena · Kevin · Gael KS · Paulo</div>
    </div>
    <div class="finops-card">
      <div class="finops-label"><span>Claude</span><span>R$ 0 / R$ 520</span></div>
      <div class="finops-bar"><div class="finops-fill safe" style="width:0%"></div></div>
      <div style="font-size:11px;color:#64748b;margin-top:4px">15 agentes · Léo · Elias · Aurora · Vera · Geórgia (×5) · Samuel · Lara +</div>
    </div>
    <div class="finops-card">
      <div class="finops-label"><span>Gemini</span><span>R$ 0 / R$ 520</span></div>
      <div class="finops-bar"><div class="finops-fill safe" style="width:0%"></div></div>
      <div style="font-size:11px;color:#64748b;margin-top:4px">6 agentes · Ricardo · Teresa · Tati · Eleonora · Kelly · Miguel</div>
    </div>
  </div>

  <div class="section-title">Meta de Crescimento</div>
  <div class="goal-section">
    <div class="goal-header">
      <span class="goal-title">Clientes Setup High-Ticket (R$ 7.100 + R$ 520/mês)</span>
      <span class="goal-progress" id="goalProgress">0</span>
    </div>
    <div class="goal-bar">
      <div class="goal-fill" id="goalFill" style="width:0%"></div>
    </div>
    <div class="goal-markers">
      <span>0</span><span>13</span><span>26</span><span>39</span><span>52</span>
    </div>
    <div class="goal-months">
      <span>Jun 2026</span><span>Jul</span><span>Ago</span><span>Set</span>
      <span>Out</span><span>Nov</span><span>Dez</span><span>Jan 2027</span>
    </div>
  </div>

</div>

<div class="modal-overlay" id="modalOverlay">
  <div class="modal" id="modal">
    <h2 id="modalIcon"></h2>
    <div class="role" id="modalRole"></div>
    <div class="detail"><strong>Squad:</strong><span id="modalSquad"></span></div>
    <div class="detail"><strong>Status:</strong><span id="modalStatus"></span></div>
    <div class="detail"><strong>LLM:</strong><span id="modalLLM"></span></div>
    <div class="detail"><strong>Skills:</strong><span id="modalSkills"></span></div>
    <button class="modal-close" onclick="closeModal()">Fechar</button>
  </div>
</div>

<div class="footer">
  Command Center · equipe_Aline Dev · <a href="#" onclick="refreshDashboard()">Atualizar</a> · Última atualização: <span id="footerUpdate">—</span>
</div>

<script>
const SQUADS = [__SQUADS_JS__];

const llmColors = {
  claude: '#6366f1',
  openai: '#10b981',
  gemini: '#f59e0b',
  deepseek: '#06b6d4',
  qwen: '#ec4899',
  kimi: '#8b5cf6',
  ollama: '#64748b'
};

function init() {
  let total = 0, active = 0;
  SQUADS.forEach(sq => {
    total += sq.agents.length;
    sq.agents.forEach(a => { if(a.status === 'working' || a.status === 'done') active++; });
  });
  document.getElementById('statAgents').textContent = total;
  document.getElementById('statActive').textContent = active;
  document.getElementById('totalAgents').textContent = total + ' Agentes';
  const now = new Date().toLocaleString('pt-BR', {timeZone:'America/Sao_Paulo'});
  document.getElementById('lastUpdate').textContent = now;
  document.getElementById('footerUpdate').textContent = now;
  renderSquads();
  renderPipelines();
}

function renderSquads() {
  const grid = document.getElementById('squadGrid');
  grid.innerHTML = '';
  SQUADS.forEach(sq => {
    const statusBadge = sq.status === 'completed' ? 'completed' : sq.status;
    const totalSteps = sq.pipeline.length;
    const currentStep = sq.step.current || 0;
    const pct = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;
    let card = document.createElement('div');
    card.className = 'squad-card';
    card.innerHTML = `
      <div class="squad-header">
        <span class="squad-name">\\${sq.icon} \\${sq.name}</span>
        <span class="squad-badge badge-\\${statusBadge}">\\${statusBadge === 'completed' ? '✅ Completo' : statusBadge === 'running' ? '▶ Rodando' : '⏸ Idle'}</span>
      </div>
      <div class="squad-body">
        <div class="squad-meta">
          <span>👥 \\${sq.agents.length} agentes</span>
          <span>⏱ \\${sq.schedule}</span>
          <span>📊 Step \\${currentStep}/\\${totalSteps} (\\${pct}%)</span>
        </div>
        <div class="agent-mini-grid">
          \\${sq.agents.map(a => `
            <div class="agent-mini \\${a.status === 'working' ? 'working' : a.status === 'done' ? 'done' : 'idle'}" onclick='showAgent("\\${a.name}","\\${a.role}","\\${sq.name}","\\${a.status}","\\${a.llm}")'>
              \\${a.icon}
              <span class="tooltip">\\${a.name}<br>\\${a.role}<br>LLM: \\${a.llm}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderPipelines() {
  const grid = document.getElementById('pipelineGrid');
  grid.innerHTML = '';
  SQUADS.forEach(sq => {
    const current = sq.step.current || 0;
    const total = sq.pipeline.length;
    let card = document.createElement('div');
    card.className = 'squad-card';
    card.innerHTML = `
      <div class="squad-header">
        <span class="squad-name">\\${sq.icon} \\${sq.name}</span>
      </div>
      <div class="squad-body">
        <div class="pipeline-flow">
          \\${sq.pipeline.map((s, i) => {
            const stepClass = i < current - 1 ? 'done' : i === current - 1 ? 'current' : '';
            return `
              <span class="step-pill \\${stepClass}">\\${s}</span>
              \\${i < sq.pipeline.length - 1 ? '<span class="step-arrow">→</span>' : ''}
            `;
          }).join('')}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function showAgent(name, role, squad, status, llm) {
  document.getElementById('modalIcon').innerHTML = name;
  document.getElementById('modalRole').textContent = role;
  document.getElementById('modalSquad').textContent = squad;
  document.getElementById('modalStatus').textContent = status === 'working' ? '▶ Trabalhando' : status === 'done' ? '✅ Completo' : '⏸ Idle';
  document.getElementById('modalLLM').textContent = llm.toUpperCase();
  document.getElementById('modalLLM').style.color = llmColors[llm] || '#94a3b8';
  document.getElementById('modalSkills').textContent = 'web_search, telegram-bridge';
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if(e.target === this) closeModal();
});

function refreshDashboard() {
  const now = new Date().toLocaleString('pt-BR', {timeZone:'America/Sao_Paulo'});
  document.getElementById('lastUpdate').textContent = now;
  document.getElementById('footerUpdate').textContent = now;
}

init();
</script>
</body>
</html>"""

def main():
    squads_js = []
    for sq in SQUADS:
        state = get_latest_state(sq["dir"])
        squads_js.append(build_squad_js(sq, state))
        if state:
            label = "✅" if state.get("status") == "completed" else "▶"
            print(f"  {label} {sq['name']} — step {state.get('step',{}).get('current',0)}/{len(sq['pipeline'])} ({state.get('status')})")
        else:
            print(f"  ⏸  {sq['name']} — sem runs")

    html = HTML_TEMPLATE.replace("__SQUADS_JS__", ",".join(squads_js))
    out_path = os.path.join(BASE, "_opensquad", "dashboard.html")
    with open(out_path, "w") as f:
        f.write(html)
    print(f"\n✅ Dashboard gerado: {out_path}")

if __name__ == "__main__":
    main()
