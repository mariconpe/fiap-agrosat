# 📡 AgroSat — Simulação de IoT

> Global Solution 2026/1 — Parte 6: Simulação ou Integração de IoT
>
> **Vídeo de Apresentação (Pitch):** [Assista no YouTube](https://www.youtube.com/watch?v=qKuYnX5o-Oc)

## Qual sensor é simulado

Sensor de **umidade do solo** instalado na propriedade rural (simulando um
sensor capacitivo de campo). É o dispositivo IoT mais relevante para o pequeno
produtor: barato, de fácil instalação e essencial para detectar estresse
hídrico da lavoura.

## O que ele mede

Percentual de umidade volumétrica do solo, na faixa de **15% a 35%**,
com variação gradual entre leituras (random walk), imitando o comportamento
real do solo ao longo do dia.

## Como influencia o sistema

1. Cada leitura é enviada para a API via `POST /api/sensores/dados` e
   persistida vinculada à propriedade.
2. O painel de **Sensores** do app mobile exibe a última leitura.
3. A engine de risco (`POST /api/alertas/verificar`) cruza a umidade do
   solo com a precipitação acumulada dos satélites: umidade **< 20%** com
   chuva acumulada **< 10mm em 15 dias** dispara o **alerta de seca**,
   que aparece na tela de Alertas do produtor. O dado do dispositivo IoT
   vira decisão automática de alerta.

## Como executar

Com a API rodando (`mvn spring-boot:run`):

```bash
# 10 leituras, uma a cada 5 segundos (padrão)
python3 iot/simulador.py

# opções
python3 iot/simulador.py --url http://localhost:8080 \
    --propriedade 1 --intervalo 2 --leituras 20
```

Requer apenas Python 3 (sem dependências externas — usa `urllib` da stdlib).

## Contrato enviado

O endpoint define a data/hora no servidor, então o corpo é apenas:

```json
{ "tipo": "UMIDADE_SOLO", "valor": 18.4, "propriedadeId": 1 }
```

`tipo` aceita os valores do enum `TipoSensor`: `UMIDADE_SOLO`, `TEMPERATURA`,
`PLUVIOMETRO`.

## Verificando

As leituras aparecem em `GET /api/sensores?propriedadeId=1` e na tela de
Sensores do app.

## Exemplo de saída

```
🛰️  Simulador AgroSat — sensor de umidade do solo
    API: http://localhost:8080 | propriedade: 1 | 10 leituras a cada 5s

[21:30:01] Leitura 1/10
  ✅ Leitura registrada (id 4): umidade 23.4%
[21:30:06] Leitura 2/10
  ✅ Leitura registrada (id 5): umidade 22.1%
...
```
