# 🌾 AgroSat — Documento de Concepção

> Global Solution 2026/1 — 4º Ano Engenharia de Software — FIAP
>
> **Tema:** Soluções para o desafio da Indústria Espacial
>
> **ODS:** 2 — Fome Zero e Agricultura Sustentável

---

## 1. Problema

Pequenos produtores rurais no Brasil tomam decisões baseadas em intuição. Sem
acesso a dados técnicos, perdem safra por seca ou praga que poderiam ter sido
previstas.

O agronegócio movimenta 25% do PIB brasileiro, mas tecnologias como imagens de
satélite e sensores inteligentes ainda estão concentradas em grandes empresas.

**A economia espacial pode mudar isso.** Dados de satélites que antes eram
exclusivos de agências espaciais agora podem chegar ao celular de quem planta.

---

## 2. Solução Proposta

**AgroSat** — plataforma de monitoramento agrícola que integra:

| Fonte de dados | Tecnologia | O que gera |
|---|---|---|
| Satélites (Landsat, Sentinel, CBERS) | Índice NDVI + clima | Mapa de saúde da lavoura |
| Sensores IoT simulados | Umidade do solo | Leitura em tempo real |
| API RESTful (Spring Boot) | Regras de risco | Alertas de seca e praga |
| App mobile (React Native) | Interface simples | Dashboard para o produtor |

---

## 3. Conexão com a Economia Espacial

- 🛰️ **Satélites de observação terrestre** → fonte primária dos dados (NDVI,
  precipitação, temperatura)
- 📡 **Infraestrutura orbital de GPS** → georreferenciamento das propriedades
- 🌍 **Mesma tecnologia usada pela NASA/INPE** para monitoramento ambiental,
  agora aplicada à agricultura de pequena escala

---

## 4. Arquitetura

```
┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│  App Mobile  │────▶│  API RESTful   │────▶│  PostgreSQL  │
│  (React/TS)  │◀────│  (Spring Boot) │◀────│  / H2        │
└──────────────┘     └───────┬────────┘     └──────────────┘
                             │
                    ┌────────┴────────┐
                    │  Dados externos │
                    │  • NDVI (mock)  │
                    │  • Clima (mock) │
                    │  • IoT (mock)   │
                    └────────────────┘
```

*As partes não precisam estar integradas — cada frente entrega sua prova de
conceito de forma independente, conforme orientação do desafio.*

---

## 5. Modelo de Dados

### Diagrama Entidade-Relacionamento

```
┌──────────────┐       ┌──────────────────┐
│   Produtor   │1────*│   Propriedade    │
│──────────────│       │──────────────────│
│ id           │       │ id               │
│ nome         │       │ nome             │
│ email        │       │ localizacao      │
│ telefone     │       │ area_hectares    │
│ senha_hash   │       │ produtor_id (FK) │
└──────────────┘       │ cultura_id  (FK) │
                       └────────┬─────────┘
                                │
                    ┌───────────┼───────────┐
                   1│         1│          1│
          ┌─────────┴──┐ ┌────┴──────┐ ┌──┴──────────┐
          │   Sensor   │ │DadoSatelite│ │   Alerta    │
          │────────────│ │────────────│ │─────────────│
          │ id         │ │ id         │ │ id          │
          │ tipo       │ │ tipo       │ │ tipo        │
          │ valor      │ │ ndvi       │ │ severidade  │
          │ data_hora  │ │ precipit   │ │ mensagem    │
          │ prop_id FK │ │ temp_min   │ │ data_criacao│
          └────────────┘ │ temp_max   │ │ lida        │
                         │ data_coleta│ │ prop_id FK  │
                         │ prop_id FK │ └─────────────┘
                         └────────────┘
```

### Entidades

| # | Entidade | Descrição |
|---|----------|-----------|
| 1 | `Produtor` | Pequeno agricultor cadastrado na plataforma |
| 2 | `Propriedade` | Talhão ou fazenda georreferenciada |
| 3 | `Cultura` | Tipo de plantio (soja, milho, etc.) |
| 4 | `Sensor` | Dispositivo IoT simulado (umidade do solo) |
| 5 | `DadoSatelite` | NDVI, precipitação, temperaturas por coleta |
| 6 | `Alerta` | Risco gerado pelo sistema (seca ou praga) |

---

## 6. API RESTful — Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/produtores` | Cadastrar produtor |
| `GET` | `/api/propriedades` | Listar propriedades |
| `POST` | `/api/propriedades` | Cadastrar propriedade |
| `GET` | `/api/propriedades/{id}/ndvi` | Consultar último NDVI |
| `GET` | `/api/propriedades/{id}/alertas` | Listar alertas ativos |
| `POST` | `/api/sensores/dados` | Registrar leitura do sensor IoT |
| `PUT` | `/api/alertas/{id}/lida` | Marcar alerta como lido |
| `POST` | `/api/alertas/verificar` | Executar verificação de riscos |

### Regras de Risco

- **Seca:** precipitação acumulada < 10mm nos últimos 15 dias **E** umidade do
  solo < 20%
- **Praga:** NDVI caiu > 0.15 em 7 dias **E** temperatura máxima > 30°C

---

## 7. Telas do App Mobile

### Tela Inicial — Login

Autenticação segura do produtor (login com hash SHA-256 no backend) com tratamento de credenciais inválidas e controle de sessão local.

### Tela 1 — Dashboard (Lavoura)

Mostra o mapa de NDVI da propriedade com escala de cores (verde = saudável, amarelo = atenção, vermelho = crítico), além dos indicadores rápidos de clima e um carrossel de métricas interativo com detalhes ao toque.

### Tela 2 — Histórico NDVI

Gráfico e histórico detalhado das coletas de NDVI para acompanhar a evolução da saúde da vegetação ao longo do tempo.

### Tela 3 — Alertas

Lista de alertas ativos de seca/praga com recomendação de ação, severidade (🔴 alta, 🟡 média, 🟢 baixa) e botão para marcar como lido.

### Tela 4 — Sensores IoT

Lista os sensores cadastrados na propriedade com a última leitura e uma barra de progresso indicando o nível atual em relação aos limites saudáveis.

---

## 8. Simulação IoT

Dispositivo simulado (script Python em [`iot/simulador.py`](../iot/simulador.py)) que envia leituras periódicas de umidade do solo para o endpoint `POST /api/sensores/dados`, gerando valores entre 15% e 35% com variação gradual ao longo do tempo.

---

## 9. Segurança

| Prática | Implementação |
|---------|---------------|
| CORS | Configurado para permitir acesso do app mobile |
| Senhas | Hash SHA-256 (bcrypt em produção) |
| Validação de entrada | Bean Validation nos DTOs |
| Tratamento de erros | `@RestControllerAdvice` com ProblemDetail (RFC 9457) |
| Autenticação (projetada) | JWT — endpoint `/api/auth/login` + filtro `OncePerRequestFilter` |

---

## 10. Tecnologias

- **Backend:** Java 17, Spring Boot 3.3.5, Spring Data JPA, Hibernate
- **Banco:** H2 (desenvolvimento), PostgreSQL (produção)
- **Documentação:** Swagger / OpenAPI 3
- **Mobile:** React Native + Expo + TypeScript
- **IoT:** Python (simulador de sensor de umidade do solo)
