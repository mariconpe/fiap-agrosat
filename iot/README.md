# Simulação IoT - AgroSat

Sensor simulado de umidade do solo. Envia leituras para `POST /api/sensores/dados`
com valores variando gradualmente entre 15% e 35%, conforme a concepção.

## Pré-requisito

```bash
pip install requests
```

## Uso

Com o backend rodando em `localhost:8080`:

```bash
# 10 leituras, uma a cada 5s, para a propriedade 1 (Fazenda Esperança do seed)
python simulador_sensor.py --leituras 10

# fluxo contínuo a cada 2s
python simulador_sensor.py --intervalo 2

# outra propriedade / outra URL
python simulador_sensor.py --propriedade 1 --url http://localhost:8080/api/sensores/dados
```

## Contrato enviado

O endpoint define a data/hora no servidor, então o corpo é apenas:

```json
{ "tipo": "UMIDADE_SOLO", "valor": 18.42, "propriedadeId": 1 }
```

`tipo` aceita os valores do enum `TipoSensor`: `UMIDADE_SOLO`, `TEMPERATURA`, `PLUVIOMETRO`.

## Verificando

As leituras aparecem em `GET /api/sensores?propriedadeId=1`.

## Explicação da lógica (qual sensor, o que mede, como influencia o sistema)

- **Sensor:** umidade do solo (`TipoSensor.UMIDADE_SOLO`), simulando um sensor
  capacitivo de campo.
- **O que mede:** percentual de umidade do solo, valores entre 15% e 35% com
  variação gradual (passeio aleatório), como um sensor real ao longo do tempo.
- **Como influencia o sistema:** cada leitura é persistida e alimenta a regra de
  risco de seca do backend. Quando a última umidade fica abaixo de 20% e a
  precipitação acumulada nos últimos 15 dias é menor que 10mm, o sistema gera um
  `Alerta` de SECA (via `POST /api/alertas/verificar`), que aparece no painel de
  monitoramento e na tela de alertas do app. Ou seja, o dado do dispositivo IoT
  vira decisão automática de alerta para o produtor.
