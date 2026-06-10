"""
Simulador de sensor IoT de umidade do solo — AgroSat.

Gera leituras entre 15% e 35% com variação gradual (random walk)
e envia para a API via POST /api/sensores/dados, simulando um
dispositivo de campo instalado na propriedade.

Uso:
    python3 simulador.py [--url URL] [--propriedade ID]
                         [--intervalo SEGUNDOS] [--leituras N]

Requer apenas a biblioteca padrão do Python (urllib).
"""

import argparse
import json
import random
import sys
import time
import urllib.error
import urllib.request

UMIDADE_MIN = 15.0
UMIDADE_MAX = 35.0
VARIACAO_MAX_POR_LEITURA = 1.5


def gerar_proxima_umidade(umidade_atual: float) -> float:
    """Aplica variação gradual mantendo o valor dentro da faixa do sensor."""
    variacao = random.uniform(-VARIACAO_MAX_POR_LEITURA, VARIACAO_MAX_POR_LEITURA)
    proxima = umidade_atual + variacao
    return round(max(UMIDADE_MIN, min(UMIDADE_MAX, proxima)), 1)


def enviar_leitura(url_base: str, propriedade_id: int, umidade: float) -> bool:
    """Envia uma leitura para a API. Retorna True se aceita (HTTP 201)."""
    payload = json.dumps({
        "tipo": "UMIDADE_SOLO",
        "valor": umidade,
        "propriedadeId": propriedade_id,
    }).encode()

    requisicao = urllib.request.Request(
        f"{url_base}/api/sensores/dados",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(requisicao, timeout=10) as resposta:
            corpo = json.loads(resposta.read())
            print(f"  ✅ Leitura registrada (id {corpo.get('id')}): "
                  f"umidade {umidade}%")
            return True
    except urllib.error.HTTPError as erro:
        print(f"  ❌ API recusou a leitura: HTTP {erro.code} — "
              f"{erro.read().decode()}")
    except urllib.error.URLError as erro:
        print(f"  ❌ API inacessível em {url_base}: {erro.reason}")
    return False


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Simulador de sensor IoT de umidade do solo")
    parser.add_argument("--url", default="http://localhost:8080",
                        help="URL base da API (padrão: http://localhost:8080)")
    parser.add_argument("--propriedade", type=int, default=1,
                        help="ID da propriedade monitorada (padrão: 1)")
    parser.add_argument("--intervalo", type=int, default=5,
                        help="Segundos entre leituras (padrão: 5)")
    parser.add_argument("--leituras", type=int, default=10,
                        help="Total de leituras a enviar (padrão: 10)")
    argumentos = parser.parse_args()

    print(f"🛰️  Simulador AgroSat — sensor de umidade do solo")
    print(f"    API: {argumentos.url} | propriedade: {argumentos.propriedade} "
          f"| {argumentos.leituras} leituras a cada {argumentos.intervalo}s\n")

    umidade = round(random.uniform(UMIDADE_MIN, UMIDADE_MAX), 1)
    enviadas = 0

    for numero in range(1, argumentos.leituras + 1):
        print(f"[{time.strftime('%H:%M:%S')}] Leitura {numero}/"
              f"{argumentos.leituras}")
        if enviar_leitura(argumentos.url, argumentos.propriedade, umidade):
            enviadas += 1
        umidade = gerar_proxima_umidade(umidade)

        if numero < argumentos.leituras:
            time.sleep(argumentos.intervalo)

    print(f"\nFim da simulação: {enviadas}/{argumentos.leituras} "
          f"leituras aceitas pela API.")
    return 0 if enviadas == argumentos.leituras else 1


if __name__ == "__main__":
    sys.exit(main())
