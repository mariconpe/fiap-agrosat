package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.AlertaResponse;
import br.com.fiap.agrosat.model.DadoSatelite;
import br.com.fiap.agrosat.model.Propriedade;
import br.com.fiap.agrosat.model.Sensor;
import br.com.fiap.agrosat.model.enums.SeveridadeAlerta;
import br.com.fiap.agrosat.model.enums.TipoAlerta;
import br.com.fiap.agrosat.model.enums.TipoDadoSatelite;
import br.com.fiap.agrosat.model.enums.TipoSensor;
import br.com.fiap.agrosat.repository.DadoSateliteRepository;
import br.com.fiap.agrosat.repository.PropriedadeRepository;
import br.com.fiap.agrosat.repository.SensorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Engine de risco do AgroSat.
 * <p>
 * Roda sob demanda e aplica duas regras:
 * <ol>
 *   <li>Seca: precipitação acumulada &lt; 10mm nos últimos 15 dias
 *       E umidade do solo &lt; 20%</li>
 *   <li>Praga: NDVI caiu mais de 0.15 nos últimos 7 dias
 *       E temperatura máxima passou de 30°C no período</li>
 * </ol>
 */
@Service
public class RiscoService {

    // limites definidos com base em literatura agronômica (EMBRAPA, FAO)
    private static final BigDecimal LIMITE_PRECIPITACAO = new BigDecimal("10");
    private static final BigDecimal LIMITE_UMIDADE_SOLO = new BigDecimal("20");
    private static final BigDecimal QUEDA_NDVI_LIMITE = new BigDecimal("0.15");
    private static final BigDecimal TEMP_LIMITE_PRAGA = new BigDecimal("30");

    private final DadoSateliteRepository dadoSateliteRepository;
    private final SensorRepository sensorRepository;
    private final PropriedadeRepository propriedadeRepository;
    private final AlertaService alertaService;

    public RiscoService(DadoSateliteRepository dadoSateliteRepository,
                        SensorRepository sensorRepository,
                        PropriedadeRepository propriedadeRepository,
                        AlertaService alertaService) {
        this.dadoSateliteRepository = dadoSateliteRepository;
        this.sensorRepository = sensorRepository;
        this.propriedadeRepository = propriedadeRepository;
        this.alertaService = alertaService;
    }

    /**
     * Dispara as regras de risco para uma propriedade.
     * Chamado pelo endpoint POST /api/alertas/verificar.
     */
    @Transactional
    public List<AlertaResponse> verificarRiscos(Long propriedadeId) {
        Propriedade propriedade = propriedadeRepository.findById(propriedadeId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Propriedade", propriedadeId));

        List<AlertaResponse> gerados = new ArrayList<>();

        AlertaResponse seca = verificarSeca(propriedade);
        if (seca != null) gerados.add(seca);

        AlertaResponse praga = verificarPraga(propriedade);
        if (praga != null) gerados.add(praga);

        return gerados;
    }

    // ================================================================
    //  REGRA 1 — SECA
    //  Gatilho: pouca chuva + solo seco
    // ================================================================

    private AlertaResponse verificarSeca(Propriedade propriedade) {
        Long propId = propriedade.getId();
        LocalDate quinzeDiasAtras = LocalDate.now().minusDays(15);
        String nome = propriedade.getNome();

        // soma a precipitação dos últimos 15 dias
        List<DadoSatelite> climaRecente = dadoSateliteRepository
                .findByPropriedade_IdAndTipoAndDataColetaAfterOrderByDataColetaAsc(
                        propId, TipoDadoSatelite.CLIMA, quinzeDiasAtras);

        if (climaRecente.isEmpty()) return null;

        BigDecimal totalPrecipitacao = climaRecente.stream()
                .map(d -> d.getPrecipitacaoMm() != null ? d.getPrecipitacaoMm()
                        : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPrecipitacao.compareTo(LIMITE_PRECIPITACAO) >= 0) {
            return null; // choveu o suficiente
        }

        // pega a leitura mais recente de umidade do solo
        List<Sensor> sensores = sensorRepository.findByPropriedade_IdAndTipo(
                propId, TipoSensor.UMIDADE_SOLO);
        if (sensores.isEmpty()) {
            return null; // sem sensor, não dá pra avaliar
        }

        Sensor ultimoSensor = sensores.get(0);
        if (ultimoSensor.getValor().compareTo(LIMITE_UMIDADE_SOLO) >= 0) {
            return null; // solo ainda está úmido
        }

        // as duas condições bateram → dispara alerta
        return alertaService.criarAlerta(propId, TipoAlerta.SECA,
                SeveridadeAlerta.ALTA,
                String.format(
                        "Risco de seca na propriedade '%s'. " +
                        "Precipitação acumulada em 15 dias: %.1f mm (limite: 10 mm). " +
                        "Umidade do solo atual: %.1f%% (limite: 20%%).",
                        nome, totalPrecipitacao, ultimoSensor.getValor()));
    }

    // ================================================================
    //  REGRA 2 — PRAGA
    //  Gatilho: NDVI caindo rápido + calor
    // ================================================================

    private AlertaResponse verificarPraga(Propriedade propriedade) {
        Long propId = propriedade.getId();
        LocalDate seteDiasAtras = LocalDate.now().minusDays(7);
        String nome = propriedade.getNome();

        // pega histórico de NDVI dos últimos 7 dias
        List<DadoSatelite> ndviRecente = dadoSateliteRepository
                .findByPropriedade_IdAndTipoAndDataColetaAfterOrderByDataColetaAsc(
                        propId, TipoDadoSatelite.NDVI, seteDiasAtras);

        if (ndviRecente.size() < 2) {
            return null; // precisa de pelo menos 2 medições pra comparar
        }

        BigDecimal primeiroNdvi = ndviRecente.get(0).getNdvi();
        BigDecimal ultimoNdvi = ndviRecente.get(ndviRecente.size() - 1).getNdvi();

        if (primeiroNdvi == null || ultimoNdvi == null) return null;

        // calcula a queda do NDVI no período
        BigDecimal queda = primeiroNdvi.subtract(ultimoNdvi);

        if (queda.compareTo(QUEDA_NDVI_LIMITE) <= 0) {
            return null; // queda dentro do normal
        }

        // verifica se teve temperatura acima de 30°C no período
        List<DadoSatelite> climaRecente = dadoSateliteRepository
                .findByPropriedade_IdAndDataColetaAfterOrderByDataColetaAsc(
                        propId, seteDiasAtras);

        boolean tempAlta = climaRecente.stream()
                .anyMatch(d -> d.getTempMax() != null &&
                        d.getTempMax().compareTo(TEMP_LIMITE_PRAGA) > 0);

        if (!tempAlta) {
            return null; // sem calor extremo, menos provável ser praga
        }

        // condições batendo → alerta de possível infestação
        return alertaService.criarAlerta(propId, TipoAlerta.PRAGA,
                SeveridadeAlerta.MEDIA,
                String.format(
                        "Possível infestação na propriedade '%s'. " +
                        "NDVI caiu de %.3f para %.3f nos últimos 7 dias " +
                        "(queda de %.3f, limite: 0.15). " +
                        "Temperatura acima de 30°C detectada no período.",
                        nome, primeiroNdvi, ultimoNdvi, queda));
    }
}
