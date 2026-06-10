#!/usr/bin/env python3
"""
Simulador de sensor IoT de umidade do solo - AgroSat.

Envia leituras periodicas para POST /api/sensores/dados.
O valor faz um passeio aleatorio gradual entre 15% e 35%,
imitando um sensor real em campo.
"""
import argparse
import random
import sys
import time

import requests


def gerar_proximo(valor_atual: float) -> float:
    """Varia o valor em ate +-1.2 e mantem dentro de [15, 35]."""
    novo = valor_atual + random.uniform(-1.2, 1.2)
    return round(max(15.0, min(35.0, novo)), 2)


def main() -> None:
    p = argparse.ArgumentParser(description="Simulador de sensor IoT - AgroSat")
    p.add_argument("--url", default="http://localhost:8080/api/sensores/dados")
    p.add_argument("--propriedade", type=int, default=1, help="ID da propriedade")
    p.add_argument("--intervalo", type=float, default=5.0, help="segundos entre leituras")
    p.add_argument("--leituras", type=int, default=0, help="0 = roda indefinidamente")
    args = p.parse_args()

    valor = round(random.uniform(15.0, 35.0), 2)
    enviadas = 0

    print(f"Enviando leituras para {args.url} (propriedade {args.propriedade})")
    while args.leituras == 0 or enviadas < args.leituras:
        valor = gerar_proximo(valor)
        payload = {
            "tipo": "UMIDADE_SOLO",
            "valor": valor,
            "propriedadeId": args.propriedade,
        }
        try:
            r = requests.post(args.url, json=payload, timeout=5)
            r.raise_for_status()
            print(f"  OK  {valor:5.2f}%  ->  201 (id {r.json().get('id')})")
        except requests.RequestException as e:
            print(f"  ERRO ao enviar {valor:5.2f}%: {e}", file=sys.stderr)

        enviadas += 1
        time.sleep(args.intervalo)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nEncerrado.")
