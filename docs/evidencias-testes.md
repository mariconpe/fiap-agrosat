# 📋 AgroSat — Evidências de Execução dos Testes

> Execução em 09/06/2026, 21:22 (BRT) — `mvn test`
>
> Ambiente: macOS, OpenJDK (Homebrew), Maven, Spring Boot 3.3.5, H2 em memória

## Resultado Geral

```
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.301 s
        -- in br.com.fiap.agrosat.AgrosatApiIntegrationTest
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  28.403 s
[INFO] Finished at: 2026-06-09T21:22:20-03:00
[INFO] ------------------------------------------------------------------------
```

## Detalhe por Caso de Teste (relatório Surefire)

| Caso | Método de teste | Tempo (s) | Resultado |
|------|-----------------|-----------|-----------|
| CT-01 | `cadastrarProdutorValido` | 0.048 | ✅ Passou |
| CT-02 | `cadastrarProdutorInvalido` | 0.008 | ✅ Passou |
| CT-03 | `loginValido` | 0.003 | ✅ Passou |
| CT-04 | `loginSenhaErrada` | 0.004 | ✅ Passou |
| CT-05 | `registrarLeituraSensor` | 0.008 | ✅ Passou |
| CT-06 | `consultarNdvi` | 0.292 | ✅ Passou |
| CT-07 | `verificarRiscosGeraAlertas` | 0.016 | ✅ Passou |
| CT-08 | `propriedadeInexistente` | 0.003 | ✅ Passou |

## Log do Seed (contexto dos testes)

```
br.com.fiap.agrosat.config.DataLoader : Carregando dados de demonstração...
br.com.fiap.agrosat.config.DataLoader : Seed concluído — produtor: joao@agrosat.com.br / senha: 123456
```

Relatórios brutos: `target/surefire-reports/` (gerados a cada `mvn test`).
