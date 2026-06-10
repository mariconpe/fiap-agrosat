# 🧪 Plano de Testes — AgroSat

Validação dos serviços da API. Todos os casos batem com o comportamento real do
backend (controllers, services e `GlobalExceptionHandler`).

Pré-requisito: aplicação rodando em `http://localhost:8080` com o seed carregado
(produtor `joao@agrosat.com.br` / senha `123456`, propriedade id `1`).

## Casos de teste

| # | Cenário | Entrada | Saída esperada | Status HTTP |
|---|---------|---------|----------------|-------------|
| TC01 | Login com credenciais válidas | `POST /api/auth/login` `{ "email":"joao@agrosat.com.br", "senha":"123456" }` | Dados do produtor (sem o hash da senha) | **200** |
| TC02 | Login com senha incorreta | `POST /api/auth/login` `{ "email":"joao@agrosat.com.br", "senha":"errada" }` | Corpo vazio (não revela se o email existe) | **401** |
| TC03 | Cadastro com email já existente | `POST /api/produtores` `{ "nome":"João", "email":"joao@agrosat.com.br", "senha":"123456" }` | ProblemDetail "Email já cadastrado" | **400** |
| TC04 | Registrar leitura de sensor IoT válida | `POST /api/sensores/dados` `{ "tipo":"UMIDADE_SOLO", "valor":18.5, "propriedadeId":1 }` | Leitura criada com id e dataHora | **201** |
| TC05 | Leitura para propriedade inexistente | `POST /api/sensores/dados` `{ "tipo":"UMIDADE_SOLO", "valor":18.5, "propriedadeId":999 }` | ProblemDetail "Propriedade não encontrado" | **404** |

## Execução

O script `run_tests.sh` executa os 5 casos, compara o status HTTP recebido com o
esperado e grava o resultado em `evidencias_testes.log` (essa é a evidência de
execução exigida no desafio).

```bash
# com a aplicação rodando em outro terminal (mvn spring-boot:run)
cd testes
bash run_tests.sh
```

Saída esperada (resumo): `TC01 PASS / TC02 PASS / TC03 PASS / TC04 PASS / TC05 PASS`.
O arquivo `evidencias_testes.log` (em `testes/evidencias_testes.log`) guarda o
request, o status e o corpo de cada resposta — é a evidência de execução para
anexar ao PDF.

## Observações

- O desafio pede no mínimo 5 casos e execução de ao menos 3; o script roda os 5.
- TC02 e TC03 cobrem segurança e regra de negócio (senha incorreta e email duplicado).
- TC04/TC05 cobrem o fluxo IoT, incluindo o caminho de erro (404).
