package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.model.DadoSatelite;
import br.com.fiap.agrosat.model.Sensor;
import br.com.fiap.agrosat.model.enums.TipoDadoSatelite;
import br.com.fiap.agrosat.model.enums.TipoSensor;
import br.com.fiap.agrosat.repository.DadoSateliteRepository;
import br.com.fiap.agrosat.repository.PropriedadeRepository;
import br.com.fiap.agrosat.repository.SensorRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class IndicadoresService {
    private final SensorRepository sensores;
    private final DadoSateliteRepository satelites;
    private final PropriedadeRepository propriedades;
    public IndicadoresService(SensorRepository sensores, DadoSateliteRepository satelites, PropriedadeRepository propriedades) {
        this.sensores = sensores; this.satelites = satelites; this.propriedades = propriedades;
    }
    public Map<String,Object> consultar(Long id) {
        propriedades.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Propriedade", id));
        LocalDate hoje = LocalDate.now(java.time.Clock.systemUTC());
        var clima15 = satelites.findByPropriedade_IdAndTipoAndDataColetaAfterOrderByDataColetaAsc(id, TipoDadoSatelite.CLIMA, hoje.minusDays(15));
        var clima7 = satelites.findByPropriedade_IdAndTipoAndDataColetaAfterOrderByDataColetaAsc(id, TipoDadoSatelite.CLIMA, hoje.minusDays(7));
        BigDecimal chuva = clima15.stream().map(d -> d.getPrecipitacaoMm() == null ? BigDecimal.ZERO : d.getPrecipitacaoMm()).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal maxTemp = clima7.stream().map(DadoSatelite::getTempMax).filter(v -> v != null).max(BigDecimal::compareTo).orElse(null);
        BigDecimal umidade = sensores.findTopByPropriedade_IdAndTipoOrderByDataHoraDescIdDesc(id, TipoSensor.UMIDADE_SOLO).map(Sensor::getValor).orElse(null);
        Map<String,Object> out = new LinkedHashMap<>(); out.put("umidadeAtual", umidade); out.put("chuvaAcumulada15Dias", chuva); out.put("temperaturaMaxima7Dias", maxTemp);
        out.put("estadoAmbiente", umidade == null && clima15.isEmpty() ? "SEM_DADOS" : ((umidade != null && umidade.compareTo(new BigDecimal("20")) < 0 && chuva.compareTo(new BigDecimal("10")) < 0) || (maxTemp != null && maxTemp.compareTo(new BigDecimal("30")) > 0) ? "ATENCAO" : "NORMAL"));
        return out;
    }
}
