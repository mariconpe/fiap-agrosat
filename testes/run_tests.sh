#!/usr/bin/env bash
#
# Executa os casos de teste do AgroSat e grava evidências em evidencias.log.
# Pré-requisito: aplicação rodando em http://localhost:8080 com o seed carregado.
#
set -u
BASE="${BASE_URL:-http://localhost:8080}"
LOG="evidencias.log"
PASS=0
FAIL=0

: > "$LOG"
echo "=== Evidências de execução - AgroSat ===" | tee -a "$LOG"
echo "Data: $(date)" | tee -a "$LOG"
echo "Base URL: $BASE" | tee -a "$LOG"
echo | tee -a "$LOG"

run() {
    local id="$1" desc="$2" method="$3" path="$4" body="$5" esperado="$6"
    local resp status corpo
    if [ -n "$body" ]; then
        resp=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE$path" \
            -H "Content-Type: application/json" -d "$body")
    else
        resp=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE$path")
    fi
    status=$(echo "$resp" | tail -n1)
    corpo=$(echo "$resp" | sed '$d')

    {
        echo "----------------------------------------------------------------"
        echo "[$id] $desc"
        echo "  $method $path"
        [ -n "$body" ] && echo "  body: $body"
        echo "  status recebido: $status | esperado: $esperado"
        echo "  resposta: ${corpo:-<vazio>}"
    } | tee -a "$LOG"

    if [ "$status" = "$esperado" ]; then
        echo "  -> PASS" | tee -a "$LOG"; PASS=$((PASS+1))
    else
        echo "  -> FAIL" | tee -a "$LOG"; FAIL=$((FAIL+1))
    fi
}

run TC01 "Login com credenciais válidas" POST /api/auth/login \
    '{"email":"joao@agrosat.com.br","senha":"123456"}' 200

run TC02 "Login com senha incorreta" POST /api/auth/login \
    '{"email":"joao@agrosat.com.br","senha":"errada"}' 401

run TC03 "Cadastro com email já existente" POST /api/produtores \
    '{"nome":"Joao","email":"joao@agrosat.com.br","telefone":"(14) 90000-0000","senha":"123456"}' 400

run TC04 "Registrar leitura de sensor IoT válida" POST /api/sensores/dados \
    '{"tipo":"UMIDADE_SOLO","valor":18.5,"propriedadeId":1}' 201

run TC05 "Leitura para propriedade inexistente" POST /api/sensores/dados \
    '{"tipo":"UMIDADE_SOLO","valor":18.5,"propriedadeId":999}' 404

echo | tee -a "$LOG"
echo "=== RESUMO: $PASS PASS / $FAIL FAIL ===" | tee -a "$LOG"
[ "$FAIL" -eq 0 ]
