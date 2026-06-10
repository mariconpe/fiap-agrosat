package br.com.fiap.agrosat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de integração da API AgroSat (plano de testes em
 * docs/plano-de-testes.md). Usa o banco H2 em memória com os
 * dados de demonstração do DataLoader:
 * produtor joao@agrosat.com.br / 123456, propriedade id 1.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AgrosatApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("CT-01: cadastrar produtor válido retorna 201 com id")
    void cadastrarProdutorValido() throws Exception {
        String body = """
                {
                  "nome": "Maria Oliveira",
                  "email": "maria@agrosat.com.br",
                  "telefone": "(14) 99999-0002",
                  "senha": "segredo123"
                }
                """;

        mockMvc.perform(post("/api/produtores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.email").value("maria@agrosat.com.br"));
    }

    @Test
    @DisplayName("CT-02: cadastrar produtor com email inválido e senha curta retorna 400")
    void cadastrarProdutorInvalido() throws Exception {
        String body = """
                {
                  "nome": "Produtor Inválido",
                  "email": "nao-eh-email",
                  "senha": "123"
                }
                """;

        mockMvc.perform(post("/api/produtores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Erro de validação"));
    }

    @Test
    @DisplayName("CT-03: login com credenciais corretas retorna 200 com dados do produtor")
    void loginValido() throws Exception {
        String body = """
                {
                  "email": "joao@agrosat.com.br",
                  "senha": "123456"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.produtorId", notNullValue()))
                .andExpect(jsonPath("$.email").value("joao@agrosat.com.br"));
    }

    @Test
    @DisplayName("CT-04: login com senha errada retorna 401")
    void loginSenhaErrada() throws Exception {
        String body = """
                {
                  "email": "joao@agrosat.com.br",
                  "senha": "senha-errada"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Não autorizado"));
    }

    @Test
    @DisplayName("CT-05: registrar leitura de sensor IoT retorna 201")
    void registrarLeituraSensor() throws Exception {
        String body = """
                {
                  "tipo": "UMIDADE_SOLO",
                  "valor": 16.8,
                  "propriedadeId": 1
                }
                """;

        mockMvc.perform(post("/api/sensores/dados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()));
    }

    @Test
    @DisplayName("CT-06: consultar NDVI da propriedade retorna 200 com índice")
    void consultarNdvi() throws Exception {
        mockMvc.perform(get("/api/propriedades/1/ndvi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ndvi", notNullValue()))
                .andExpect(jsonPath("$.status", notNullValue()));
    }

    @Test
    @DisplayName("CT-07: verificação de riscos gera alertas de seca e praga com dados do seed")
    void verificarRiscosGeraAlertas() throws Exception {
        mockMvc.perform(post("/api/alertas/verificar")
                        .param("propriedadeId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alertasGerados",
                        greaterThanOrEqualTo(2)));
    }

    @Test
    @DisplayName("CT-08: consultar propriedade inexistente retorna 404")
    void propriedadeInexistente() throws Exception {
        mockMvc.perform(get("/api/propriedades/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Recurso não encontrado"));
    }
}
