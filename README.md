# 🌾 AgroSat

Plataforma de monitoramento agrícola via dados de satélite para pequenos
produtores rurais.

**Global Solution 2026/1 — 4ESOA — FIAP**

## Stack

- **Backend:** Java 17, Spring Boot 3.3.5, Spring Data JPA / Hibernate
- **Banco:** H2 (dev) / PostgreSQL (prod) — scripts SQL em [`banco/`](banco/)
- **Docs da API:** Swagger / OpenAPI 3
- **Mobile:** React Native + TypeScript (Expo SDK 54)
- **IoT:** simulador em Python 3 (stdlib)

## Como rodar (passo a passo)

**Pré-requisitos:** Java 17+, Maven, Node.js 20+, Python 3 e, para ver o app
no celular, o [Expo Go](https://expo.dev/go) instalado. Clone o repositório e
siga na ordem — passos 1, 3 e 4 ficam cada um em um terminal próprio.

### 1. Subir a API

```bash
mvn spring-boot:run
```

Sobe em `http://localhost:8080` com banco H2 em memória já populado
(seção "Dados de seed" abaixo). Para conferir:

- Swagger: http://localhost:8080/swagger-ui/index.html
- H2 Console: http://localhost:8080/h2-console (JDBC `jdbc:h2:mem:agrosat`, user `sa`, sem senha)

### 2. Rodar os testes

```bash
mvn test
```

8 testes de integração (JUnit 5 + MockMvc). Plano em
[docs/plano-de-testes.md](docs/plano-de-testes.md), evidências em
[docs/evidencias-testes.md](docs/evidencias-testes.md) e smoke tests via
curl em [`testes/`](testes/).

### 3. Simulador IoT

Com a API no ar, em outro terminal:

```bash
python3 iot/simulador.py
```

Envia 10 leituras de umidade do solo para `POST /api/sensores/dados`,
alimentando a regra de seca e a tela de Sensores do app. Detalhes em
[iot/README.md](iot/README.md).

### 4. App mobile

```bash
cd mobile
npm install
npx expo start
# escanear o QR code com o Expo Go (celular no mesmo Wi-Fi)
# ou: npm run web — abre no navegador, jeito mais rápido de ver funcionando
```

Fluxo do app: **login** (conta demo abaixo) → **Lavoura** (mapa de satélite
com o talhão tingido pelo status NDVI + carrossel de métricas com detalhes ao
toque) → **Alertas** (riscos de seca/praga com recomendação de ação e badge de
não lidos) → **Sensores** (leituras IoT) → **histórico NDVI** e **perfil** com
logout pela tab bar.

O app consome a API em `http://localhost:8080`; sem a API no ar, usa dados
mockados equivalentes ao seed — o login demo funciona nos dois casos.
Instruções completas (Android/iOS, conexão com o backend, versões) em
[`mobile/README.md`](mobile/README.md).

### Dados de seed

A aplicação sobe com dados de demonstração de uma propriedade real:

- **Produtor:** joao@agrosat.com.br / senha: 123456
- **Propriedade:** Fazenda Esperança — Botucatu/SP — 120.5 hectares — Soja
- **NDVI:** 0.41 (em queda — risco de praga)
- **Precipitação:** 3mm em 15 dias (risco de seca)

## Estrutura

```
src/main/java/br/com/fiap/agrosat/
├── AgrosatApplication.java
├── model/          # Entidades JPA (Produtor, Propriedade, Sensor, etc.)
├── dto/            # DTOs com Bean Validation
├── repository/     # Spring Data JPA
├── service/        # Regras de negócio (RiscoService = engine de alertas)
├── controller/     # REST endpoints
└── config/         # Swagger, CORS, tratamento de erros, seed
```

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/login` | Login do produtor (senha por hash SHA-256) |
| `POST` | `/api/produtores` | Cadastrar produtor |
| `GET` | `/api/propriedades` | Listar propriedades |
| `POST` | `/api/propriedades` | Cadastrar propriedade |
| `GET` | `/api/propriedades/{id}/ndvi` | Último NDVI + status |
| `GET` | `/api/propriedades/{id}/alertas` | Alertas ativos |
| `POST` | `/api/sensores/dados` | Registrar leitura IoT |
| `POST` | `/api/alertas/verificar` | Rodar engine de risco |

## Banco de dados

Scripts em [`banco/`](banco/): `schema.sql` (CREATE TABLE com PK/FK no dialeto H2),
`seed.sql` (dados de demonstração) e `consultas.sql` (3 consultas de exemplo).

## Segurança

Login com senha criptografada em `POST /api/auth/login` (compara hash SHA-256
em tempo constante, nunca a senha em texto puro). Práticas aplicadas: validação
de entrada (Bean Validation), criptografia de senha, proteção contra SQL
Injection (consultas parametrizadas do JPA) e CORS controlado. Detalhes em
[`docs/seguranca.md`](docs/seguranca.md).

```bash
# testar login (após subir a aplicação)
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@agrosat.com.br","senha":"123456"}'   # 200
```

## Documentação

- [Documento de concepção](docs/concepcao.md)
- [Segurança (login + práticas + JWT projetado)](docs/seguranca.md)

## Equipe

4º Ano Engenharia de Software — FIAP — Turma de Fevereiro
