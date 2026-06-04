#!/bin/bash
# update-dashboard.sh
# Regenera o Command Center com os dados mais recentes dos squads
# Uso: bash _opensquad/update-dashboard.sh

echo "🔄 Atualizando Command Center..."
python3 "/home/alinedeolivgs/🧩DEV/💡equipe aline_dev/_opensquad/generate-dashboard.py"
