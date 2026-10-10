package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.DadoSateliteRequest;
import br.com.fiap.agrosat.model.enums.TipoDadoSatelite;
import br.com.fiap.agrosat.model.enums.TipoSensor;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

/** Valida limites experimentais e prepara dados de entrada para persistência. */
@Service
public class ProcessamentoService {
    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal HUNDRED = new BigDecimal("100");
    @Value("${agrosat.validacao.temperatura-min:-50}") private BigDecimal minTemp;
    @Value("${agrosat.validacao.temperatura-max:60}") private BigDecimal maxTemp;

    public void validarSensor(TipoSensor tipo, BigDecimal valor) {
        if (tipo == TipoSensor.UMIDADE_SOLO && (valor.compareTo(ZERO) < 0 || valor.compareTo(HUNDRED) > 0))
            throw new IllegalArgumentException("Umidade deve estar entre 0 e 100%.");
        if (tipo == TipoSensor.TEMPERATURA && foraTemperatura(valor))
            throw new IllegalArgumentException("Temperatura deve estar entre -50 e 60°C.");
        if (tipo == TipoSensor.PLUVIOMETRO && valor.compareTo(ZERO) < 0)
            throw new IllegalArgumentException("Precipitação não pode ser negativa.");
    }

    public void validarSatelite(DadoSateliteRequest dado) {
        if (dado.getTipo() == TipoDadoSatelite.NDVI) {
            if (dado.getNdvi() == null || dado.getNdvi().compareTo(BigDecimal.ONE.negate()) < 0 || dado.getNdvi().compareTo(BigDecimal.ONE) > 0)
                throw new IllegalArgumentException("NDVI deve estar entre -1 e 1.");
        } else {
            if (dado.getPrecipitacaoMm() != null && dado.getPrecipitacaoMm().compareTo(ZERO) < 0)
                throw new IllegalArgumentException("Precipitação não pode ser negativa.");
            if ((dado.getTempMin() != null && foraTemperatura(dado.getTempMin())) || (dado.getTempMax() != null && foraTemperatura(dado.getTempMax())))
                throw new IllegalArgumentException("Temperatura deve estar entre -50 e 60°C.");
            if (dado.getTempMin() != null && dado.getTempMax() != null && dado.getTempMin().compareTo(dado.getTempMax()) > 0)
                throw new IllegalArgumentException("Temperatura mínima não pode exceder a máxima.");
        }
    }

    private boolean foraTemperatura(BigDecimal valor) {
        return valor.compareTo(minTemp) < 0 || valor.compareTo(maxTemp) > 0;
    }
}
