package br.com.fiap.agrosat;

import br.com.fiap.agrosat.model.Produtor;
import br.com.fiap.agrosat.model.Propriedade;
import br.com.fiap.agrosat.repository.ProdutorRepository;
import br.com.fiap.agrosat.repository.PropriedadeRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AgrosatFluxosIntegracaoTest {
    @Autowired MockMvc mvc;
    @Autowired ProdutorRepository produtores;
    @Autowired PropriedadeRepository propriedades;
    private Long propriedadeId;

    @BeforeEach
    void novaPropriedadeSemLeituras() {
        Produtor produtor = produtores.findByEmail("joao@agrosat.com.br").orElseThrow();
        propriedadeId = propriedades.save(new Propriedade("Teste " + UUID.randomUUID(), "Botucatu", BigDecimal.ONE, produtor, null)).getId();
    }

    @Test
    void ingestaoAutomaticaDeduplicaAlertaESeparaLidoDeResolvido() throws Exception {
        LocalDate hoje = LocalDate.now(Clock.systemUTC());
        postarClima(hoje, "0", null);
        String instante = LocalDateTime.now(Clock.systemUTC()).withNano(0).toString();
        String sensor = sensorBody("18.0", instante, "TESTE");

        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON).content(sensor))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.validacao").value("VALIDO"));
        String alertas = mvc.perform(get("/api/alertas").param("propriedadeId", propriedadeId.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$[?(@.tipo == 'SECA' && @.resolvido == false)]", hasSize(1)))
                .andReturn().getResponse().getContentAsString();
        Number alertaIdJson = com.jayway.jsonpath.JsonPath.read(alertas, "$[0].id");
        long alertaId = alertaIdJson.longValue();

        mvc.perform(post("/api/alertas/verificar").param("propriedadeId", propriedadeId.toString()))
                .andExpect(status().isOk());
        mvc.perform(get("/api/alertas").param("propriedadeId", propriedadeId.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$[?(@.tipo == 'SECA' && @.resolvido == false)]", hasSize(1)));

        mvc.perform(put("/api/alertas/{id}/lida", alertaId)).andExpect(status().isOk())
                .andExpect(jsonPath("$.lida").value(true)).andExpect(jsonPath("$.resolvido").value(false));
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON).content(sensor))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.validacao").value("DUPLICADO"));
        mvc.perform(get("/api/alertas").param("propriedadeId", propriedadeId.toString()))
                .andExpect(jsonPath("$[?(@.tipo == 'SECA' && @.resolvido == false)]", hasSize(1)));

        postarClima(hoje, "20", null);
        mvc.perform(get("/api/alertas").param("propriedadeId", propriedadeId.toString()))
                .andExpect(jsonPath("$[?(@.tipo == 'SECA' && @.resolvido == true && @.lida == true)]", hasSize(1)));
    }

    @Test
    void ingestaoDeNdviEClimaPodeGerarAlertaDePraga() throws Exception {
        LocalDate hoje = LocalDate.now(Clock.systemUTC());
        postarNdvi(hoje.minusDays(6), "0.70");
        postarClima(hoje.minusDays(2), "15", "34");
        postarNdvi(hoje, "0.50");
        mvc.perform(get("/api/alertas").param("propriedadeId", propriedadeId.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$[?(@.tipo == 'PRAGA' && @.resolvido == false)]", hasSize(1)));
    }

    @Test
    void condicoesNormaisNaoCriamAlertaEHistoricoInsuficienteNaoDisparaPraga() throws Exception {
        LocalDate hoje = LocalDate.now(Clock.systemUTC());
        postarClima(hoje, "18", "27");
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody("35", null, "TESTE"))).andExpect(status().isCreated());
        postarNdvi(hoje.minusDays(3), "0.640");
        postarNdvi(hoje, "0.635");
        mvc.perform(get("/api/alertas").param("propriedadeId", propriedadeId.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));

        Long propriedadeSemHistorico = criarOutraPropriedade();
        String idAnterior = propriedadeId.toString();
        propriedadeId = propriedadeSemHistorico;
        postarClima(hoje, "0", "35");
        postarNdvi(hoje, "0.4");
        mvc.perform(get("/api/alertas").param("propriedadeId", propriedadeId.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));
        propriedadeId = Long.valueOf(idAnterior);
    }

    @Test
    void propriedadeSemDadosRetornaEstadoAnaliticoVazio() throws Exception {
        mvc.perform(get("/api/propriedades/{id}/indicadores", propriedadeId))
                .andExpect(status().isOk()).andExpect(jsonPath("$.estadoAmbiente").value("SEM_DADOS"))
                .andExpect(jsonPath("$.umidadeAtual").doesNotExist())
                .andExpect(jsonPath("$.temperaturaMaxima7Dias").doesNotExist());
        mvc.perform(get("/api/propriedades/{id}/ndvi/historico", propriedadeId))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void marcaDuplicidadeDeDadosSatelitaisPelaPropriedadeTipoDataEValores() throws Exception {
        LocalDate hoje = LocalDate.now(Clock.systemUTC());
        String corpoNdvi = ndviBody(hoje, "0.700");
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON).content(corpoNdvi))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.validacao").value("VALIDO"));
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON).content(corpoNdvi))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.validacao").value("DUPLICADO"));
    }

    @Test
    void timestampsComOffsetViraramUtcEEmpateOrdenaPorId() throws Exception {
        String instanteOffset = "2026-10-10T12:00:00-03:00";
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody("25", instanteOffset, "TESTE")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.dataHora").value("2026-10-10T15:00:00Z"));
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody("27", instanteOffset, "OUTRA_ORIGEM")))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/sensores").param("propriedadeId", propriedadeId.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].valor").value(27))
                .andExpect(jsonPath("$[0].origem").value("OUTRA_ORIGEM"));
    }

    @Test
    void indicadoresEHistoricoAnaliticoRefletemDadosPersistidos() throws Exception {
        LocalDate hoje = LocalDate.now(Clock.systemUTC());
        postarClima(hoje, "4.5", "32.5");
        postarNdvi(hoje.minusDays(3), "0.70");
        postarNdvi(hoje, "0.55");
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody("36", LocalDateTime.now(Clock.systemUTC()).toString(), "TESTE")))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/propriedades/{id}/indicadores", propriedadeId))
                .andExpect(status().isOk()).andExpect(jsonPath("$.umidadeAtual").value(36))
                .andExpect(jsonPath("$.chuvaAcumulada15Dias").value(4.5))
                .andExpect(jsonPath("$.temperaturaMaxima7Dias").value(32.5));
        mvc.perform(get("/api/propriedades/{id}/ndvi/historico", propriedadeId))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].dataColeta").value(hoje.minusDays(3).toString()))
                .andExpect(jsonPath("$[1].dataColeta").value(hoje.toString()));
    }

    @Test
    void rejeitaValoresForaDaFaixaEExportaEstadoDeValidacao() throws Exception {
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody("100.1", null, "TESTE")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON)
                        .content(ndviBody(LocalDate.now(Clock.systemUTC()), "1.001")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON)
                        .content(climaBody(LocalDate.now(Clock.systemUTC()), "-0.1", null)))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBodyTipo("TEMPERATURA", "61", null, "TESTE")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBodyTipo("PLUVIOMETRO", "-0.01", null, "TESTE")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody("-0.1", null, "TESTE")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tipo\":\"CLIMA\",\"tempMin\":-51,\"tempMax\":60,\"dataColeta\":\"" + LocalDate.now(Clock.systemUTC()) + "\",\"propriedadeId\":" + propriedadeId + "}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tipo\":\"CLIMA\",\"dataColeta\":\"" + LocalDate.now(Clock.systemUTC()) + "\",\"propriedadeId\":" + propriedadeId + "}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tipo\":\"CLIMA\",\"precipitacaoMm\":0,\"tempMin\":30,\"tempMax\":20,\"dataColeta\":\"" + LocalDate.now(Clock.systemUTC()) + "\",\"propriedadeId\":" + propriedadeId + "}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON)
                        .content(ndviBody(LocalDate.now(Clock.systemUTC()), "-1")))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON)
                        .content(ndviBody(LocalDate.now(Clock.systemUTC()), "1")))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody("100", null, "TESTE")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.dataHora", notNullValue()));
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody("0", null, "TESTE")))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/sensores/dados").contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBodyTipo("TEMPERATURA", "-50", null, "TESTE")))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tipo\":\"CLIMA\",\"tempMin\":-50,\"tempMax\":60,\"dataColeta\":\"" + LocalDate.now(Clock.systemUTC()) + "\",\"propriedadeId\":" + propriedadeId + "}"))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/dados/exportar").param("propriedadeId", propriedadeId.toString()))
                .andExpect(status().isOk()).andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content().string(org.hamcrest.Matchers.containsString("VALIDO")));
    }

    private void postarClima(LocalDate data, String precipitacao, String tempMax) throws Exception {
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON)
                .content(climaBody(data, precipitacao, tempMax))).andExpect(status().isCreated());
    }

    private Long criarOutraPropriedade() {
        Produtor produtor = produtores.findByEmail("joao@agrosat.com.br").orElseThrow();
        return propriedades.save(new Propriedade("Teste " + UUID.randomUUID(), "Botucatu", BigDecimal.ONE, produtor, null)).getId();
    }

    private void postarNdvi(LocalDate data, String ndvi) throws Exception {
        mvc.perform(post("/api/dados-satelite").contentType(MediaType.APPLICATION_JSON)
                .content(ndviBody(data, ndvi))).andExpect(status().isCreated());
    }

    private String climaBody(LocalDate data, String chuva, String tempMax) {
        return "{\"tipo\":\"CLIMA\",\"precipitacaoMm\":" + chuva + ",\"tempMax\":" + (tempMax == null ? "null" : tempMax) + ",\"dataColeta\":\"" + data + "\",\"propriedadeId\":" + propriedadeId + ",\"origem\":\"TESTE\"}";
    }
    private String ndviBody(LocalDate data, String ndvi) {
        return "{\"tipo\":\"NDVI\",\"ndvi\":" + ndvi + ",\"dataColeta\":\"" + data + "\",\"propriedadeId\":" + propriedadeId + ",\"origem\":\"TESTE\"}";
    }
    private String sensorBody(String valor, String dataHora, String origem) {
        return sensorBodyTipo("UMIDADE_SOLO", valor, dataHora, origem);
    }
    private String sensorBodyTipo(String tipo, String valor, String dataHora, String origem) {
        return "{\"tipo\":\"" + tipo + "\",\"valor\":" + valor + ",\"dataHora\":" + (dataHora == null ? "null" : "\"" + dataHora + "\"") + ",\"propriedadeId\":" + propriedadeId + ",\"origem\":\"" + origem + "\"}";
    }
}
