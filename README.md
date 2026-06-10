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

## Documentação

- [Documento de concepção](docs/concepcao.md)
- [Segurança (login + práticas + JWT projetado)](docs/seguranca.md)

## Banco de dados

Scripts em [`banco/`](banco/): `schema.sql` (CREATE TABLE com PK/FK no dialeto H2),
`seed.sql` (dados de demonstração) e `consultas.sql` (3 consultas de exemplo).
Em execução, o banco também pode ser inspecionado no H2 Console em
http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:agrosat`, user `sa`, sem senha).

## Segurança

Login com senha criptografada em `POST /api/auth/login` (compara hash SHA-256,
nunca a senha em texto puro). Práticas aplicadas: validação de entrada (Bean
Validation), criptografia de senha, proteção contra SQL Injection (consultas
parametrizadas do JPA) e CORS controlado. Detalhes em [`docs/seguranca.md`](docs/seguranca.md).

```bash
# testar login (após subir a aplicação)
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@agrosat.com.br","senha":"123456"}'   # 200
```

## Simulação IoT

Sensor simulado de umidade do solo em [`iot/`](iot/). Envia leituras para
`POST /api/sensores/dados`, alimentando a regra de seca.

```bash
pip install requests
python iot/simulador_sensor.py --leituras 10
```

## Equipe

4º Ano Engenharia de Software — FIAP — Turma de Fevereiro
