# 🌾 AgroSat

Plataforma de monitoramento agrícola via dados de satélite para pequenos
produtores rurais.

**Global Solution 2026/1 — 4ESOA — FIAP**

## Stack

- Java 17
- Spring Boot 3.3.5
- Spring Data JPA / Hibernate
- H2 (dev) / PostgreSQL (prod)
- Swagger / OpenAPI 3

## Como rodar

```bash
# precisa de Java 17+ e Maven
mvn spring-boot:run
```

Acessar: http://localhost:8080/swagger-ui/index.html

### Testes

```bash
mvn test
```

Plano de testes em [docs/plano-de-testes.md](docs/plano-de-testes.md) e
evidências em [docs/evidencias-testes.md](docs/evidencias-testes.md).

### Simulador IoT

Com a API rodando:

```bash
python3 iot/simulador.py
```

Detalhes em [iot/README.md](iot/README.md).

### App mobile

```bash
cd mobile
npm install
npx expo start
```

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
| `GET` | `/api/propriedades` | Listar propriedades |
| `POST` | `/api/propriedades` | Cadastrar propriedade |
| `GET` | `/api/propriedades/{id}/ndvi` | Último NDVI + status |
| `GET` | `/api/propriedades/{id}/alertas` | Alertas ativos |
| `POST` | `/api/sensores/dados` | Registrar leitura IoT |
| `POST` | `/api/alertas/verificar` | Rodar engine de risco |
| `POST` | `/api/auth/login` | Autenticar produtor (senha com hash SHA-256) |

## Documentação

- [Documento de concepção](docs/concepcao.md)

## Equipe

4º Ano Engenharia de Software — FIAP — Turma de Fevereiro
