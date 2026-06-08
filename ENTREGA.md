# 🎓 AgroSat — Guia de Entrega

> Global Solution 2026/1 — 4º Ano Engenharia de Software — FIAP
>
> **Repositório:** https://github.com/Dsfr62/fiap-agrosat
>
> **Time:** separado em 3 fases — você ficou com a **ideia/concepção**.

---

## ✅ O que já está pronto (sua parte — IDEIA)

### 📐 Documento de concepção
**Arquivo:** `AgroSat-Projeto.md` (no Downloads, ao lado do PDF da Global Solution)

Cobre:
- Problema e justificativa (pequeno produtor decide no escuro)
- Solução proposta (NDVI + clima + IoT → alertas)
- Conexão com Economia Espacial (satélites Landsat/Sentinel/CBERS)
- ODS 2 (Fome Zero e Agricultura Sustentável)
- Arquitetura do MVP
- Modelo de dados (6 entidades com DER)
- Esboço dos 7 endpoints da API
- Wireframe das 3 telas mobile
- Simulação IoT
- Práticas de segurança

### ⚙️ API implementada (extra — você já adiantou!)
**Pasta:** `repos/fiap/agrosat/`

Stack: Java 17 + Spring Boot 3.3.5 + JPA/Hibernate + H2 + Swagger

Entregáveis cobertos pela API:
- ✅ Banco de Dados (Parte 1): 6 entidades, DER incluso no doc
- ✅ Backend (Parte 2): 13 endpoints, Controller/Service/Repository, Swagger
- ⬜ Mobile (Parte 3): falta — seu time faz
- ⬜ IoT simulado (Parte 4): falta — mas endpoint `POST /api/sensores/dados` já existe
- ⬜ Segurança (Parte 5): parcial — CORS + validação + hash SHA-256; JWT pode ser adicionado
- ⬜ Vídeo Pitch (Parte 6): falta

---

## 📋 O que seu time PRECISA fazer

Repasse isso para cada pessoa:

### 👤 Responsável 1 — Banco de Dados
**Já tem pronto na API.** O que precisa entregar:
1. Copiar o DER do `AgroSat-Projeto.md` para o documento de entrega
2. Gerar o script SQL (o Hibernate gera as tabelas, mas precisam do `.sql`)
   - Rode a API localmente e exporte do H2 Console (`/h2-console`)
   - Ou gere manualmente com base nas entidades em `model/`
3. Escrever 3 consultas SQL de exemplo:
   ```sql
   -- NDVI mais recente por propriedade
   SELECT * FROM dados_satelite WHERE propriedade_id = 1 AND tipo = 'NDVI'
   ORDER BY data_coleta DESC LIMIT 1;

   -- Alertas ativos
   SELECT * FROM alertas WHERE propriedade_id = 1 AND lida = false;

   -- Média de umidade do solo por propriedade
   SELECT AVG(valor) FROM sensores WHERE propriedade_id = 1 AND tipo = 'UMIDADE_SOLO';
   ```

### 👤 Responsável 2 — Backend
**Já tem pronto.** O que precisa entregar:
1. Documentar no relatório que a API foi feita em **Java 17 + Spring Boot 3.3.5**
2. Listar os **13 endpoints** (use o Swagger: `http://localhost:8080/swagger-ui/index.html`)
3. Mostrar a arquitetura em camadas (Controller → Service → Repository)
4. Print do Swagger como evidência
5. Explicar as regras de risco no `RiscoService.java`

### 👤 Responsável 3 — Mobile
**Falta fazer.** Use os wireframes do `AgroSat-Projeto.md` como base:
- **Tela 1:** Dashboard com mapa NDVI, temperatura, umidade, precipitação
- **Tela 2:** Lista de Alertas (seca/praga com severidade)
- **Tela 3:** Sensores IoT (leituras em tempo real)
- Dados podem ser **mockados** (não precisa integrar com a API)

Stack sugerida: React Native + TS (alinhado à stack Novasce), mas usem o que foi ensinado.

### 👤 Responsável 4 — IoT
**Endpoint já existe.** O que precisa entregar:
- Um script simples (Python, Java ou C#) que envia leituras para:
  ```
  POST http://localhost:8080/api/sensores/dados
  Content-Type: application/json
  {"tipo":"UMIDADE_SOLO","valor":23.7,"propriedadeId":1}
  ```
- Simular 3 sensores com valores variando entre 15% e 35% ao longo do tempo
- Explicar no relatório o conceito de IoT + conexão com agricultura de precisão

### 👤 Responsável 5 — Segurança
**Parcialmente pronto.** O que complementar:
- Já temos: CORS configurado, validação Bean Validation, hash SHA-256 nas senhas
- Adicionar JWT (opcional para o MVP, mas conta pontos)
- Se não implementar JWT, documentar no relatório **como seria feito**:
  - `POST /api/auth/login` → retorna token JWT
  - `Authorization: Bearer <token>` nos headers
  - Spring Security com filtro `OncePerRequestFilter`

### 👤 Responsável 6 — Vídeo Pitch (3 min)
- Apresentar o problema (pequeno produtor sem dados)
- Mostrar a solução AgroSat (usar os wireframes como storyboard)
- Destacar a conexão com Economia Espacial (dados de satélite → agricultura)
- Mencionar ODS 2
- Se possível, mostrar a API rodando (Swagger) ou telas mockadas

---

## 🚀 Como rodar a API na sua máquina

```bash
# Pré-requisito: Java 17+ e Maven
git clone git@github.com:Dsfr62/fiap-agrosat.git
cd fiap-agrosat
mvn spring-boot:run
```

Acesse:
- **Swagger UI:** http://localhost:8080/swagger-ui/index.html
- **H2 Console:** http://localhost:8080/h2-console (URL: `jdbc:h2:mem:agrosat`, user: `sa`)
- **Dados de seed:** produtor `joao@agrosat.com.br` / senha `123456`

### Fluxo de teste rápido
```bash
# 1. Ver propriedades
curl http://localhost:8080/api/propriedades

# 2. Ver NDVI
curl http://localhost:8080/api/propriedades/1/ndvi

# 3. Rodar engine de risco
curl -X POST "http://localhost:8080/api/alertas/verificar?propriedadeId=1"

# 4. Ver alertas gerados
curl "http://localhost:8080/api/propriedades/1/alertas"

# 5. Registrar leitura de sensor
curl -X POST http://localhost:8080/api/sensores/dados \
  -H "Content-Type: application/json" \
  -d '{"tipo":"UMIDADE_SOLO","valor":15.2,"propriedadeId":1}'
```

---

## 📦 Checklist de entrega

| # | Item | Status | Responsável |
|---|------|--------|-------------|
| 1 | `.txt` com RM + Nome de cada aluno no `.zip` | ⬜ | Todos |
| 2 | Documento de ideia (AgroSat-Projeto.md) | ✅ | Você |
| 3 | Diagrama ER + script SQL + consultas | ⬜ | DB |
| 4 | API RESTful + Swagger + 5+ endpoints | ✅ | Backend |
| 5 | App mobile com 3+ telas | ⬜ | Mobile |
| 6 | Simulação IoT | ⬜ | IoT |
| 7 | Práticas de segurança | ⬜ | Segurança |
| 8 | Vídeo Pitch 3 min | ⬜ | Todos |

---

## 🔗 Links importantes

- **Repositório:** https://github.com/Dsfr62/fiap-agrosat
- **Documento de ideia:** `Downloads/AgroSat-Projeto.md`
- **PDF da Global Solution:** `Downloads/4ESOA - Global Solution 2026-1.pptx_RevFinal (1).pdf`
- **Swagger (API rodando):** http://localhost:8080/swagger-ui/index.html
