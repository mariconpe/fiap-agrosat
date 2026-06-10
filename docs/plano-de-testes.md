# 🧪 AgroSat — Plano de Testes da Aplicação

> Global Solution 2026/1 — Parte 3: Plano de Testes
>
> **Estratégia:** testes de integração automatizados com JUnit 5 + Spring
> MockMvc, executados contra o banco H2 em memória populado pelo
> `DataLoader` (produtor `joao@agrosat.com.br` / senha `123456`,
> propriedade "Fazenda Esperança" com id 1).

---

## 1. Escopo

Validar os fluxos principais da API RESTful:

- Cadastro e validação de produtores
- Autenticação (login com hash SHA-256)
- Ingestão de dados de sensores IoT
- Consulta de NDVI
- Engine de risco (alertas de seca e praga)
- Tratamento de erros (RFC 9457 / ProblemDetail)

## 2. Casos de Teste

| ID | Cenário | Entrada | Saída Esperada | Status |
|----|---------|---------|----------------|--------|
| CT-01 | Cadastrar produtor válido | `POST /api/produtores` com nome, email, telefone e senha válidos | HTTP 201, JSON com `id` gerado e email cadastrado | ✅ Passou |
| CT-02 | Cadastrar produtor inválido | `POST /api/produtores` com email `nao-eh-email` e senha de 3 caracteres | HTTP 400, ProblemDetail com título "Erro de validação" | ✅ Passou |
| CT-03 | Login com credenciais corretas | `POST /api/auth/login` com `joao@agrosat.com.br` / `123456` | HTTP 200, JSON com `produtorId`, `nome` e `email` | ✅ Passou |
| CT-04 | Login com senha errada | `POST /api/auth/login` com senha incorreta | HTTP 401, ProblemDetail "Não autorizado" (mensagem genérica, sem revelar se o email existe) | ✅ Passou |
| CT-05 | Registrar leitura de sensor IoT | `POST /api/sensores/dados` com tipo `UMIDADE_SOLO`, valor 16.8, propriedade 1 | HTTP 201, JSON com `id` da leitura | ✅ Passou |
| CT-06 | Consultar NDVI da propriedade | `GET /api/propriedades/1/ndvi` | HTTP 200, JSON com `ndvi` e `status` preenchidos | ✅ Passou |
| CT-07 | Verificação de riscos com dados críticos | `POST /api/alertas/verificar?propriedadeId=1` (seed: precipitação 3mm/15 dias, umidade 18.5%, NDVI 0.65→0.41, temp. máx. 33°C) | HTTP 200, `alertasGerados` ≥ 2 (seca + praga) | ✅ Passou |
| CT-08 | Consultar propriedade inexistente | `GET /api/propriedades/9999` | HTTP 404, ProblemDetail "Recurso não encontrado" | ✅ Passou |

## 3. Execução

```bash
mvn test
```

Implementação: `src/test/java/br/com/fiap/agrosat/AgrosatApiIntegrationTest.java`

## 4. Evidências

Saída completa da execução em [`evidencias-testes.md`](evidencias-testes.md).
