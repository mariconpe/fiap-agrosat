package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.DadoSateliteRequest;
import br.com.fiap.agrosat.model.enums.TipoDadoSatelite;
import br.com.fiap.agrosat.model.enums.TipoSensor;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

/** Valida limites experimentais e prepara dados de entrada para persistência. */
@Service
public class ProcessamentoService {
    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal HUNDRED = new BigDecimal("100");
    @Value("${agrosat.validacao.temperatura-min:-50}") private BigDecimal minTemp = new BigDecimal("-50");
    @Value("${agrosat.validacao.temperatura-max:60}") private BigDecimal maxTemp = new BigDecimal("60");

    public void validarSensor(TipoSensor tipo, BigDecimal valor) {
        if (tipo == TipoSensor.UMIDADE_SOLO && (valor.compareTo(ZERO) < 0 || valor.compareTo(HUNDRED) > 0))
            throw new IllegalArgumentException("Umidade deve estar entre 0 e 100%.");
        if (tipo == TipoSensor.TEMPERATURA && foraTemperatura(valor))
            throw new IllegalArgumentException("Temperatura deve estar entre " + minTemp.toPlainString() + " e " + maxTemp.toPlainString() + "°C.");
        if (tipo == TipoSensor.PLUVIOMETRO && valor.compareTo(ZERO) < 0)
            throw new IllegalArgumentException("Precipitação não pode ser negativa.");
    }

    public void validarSatelite(DadoSateliteRequest dado) {
        if (dado.getTipo() == TipoDadoSatelite.NDVI) {
            if (dado.getPrecipitacaoMm() != null || dado.getTempMin() != null || dado.getTempMax() != null)
                throw new IllegalArgumentException("Dado NDVI não deve conter medições climáticas.");
            if (dado.getNdvi() == null || dado.getNdvi().compareTo(BigDecimal.ONE.negate()) < 0 || dado.getNdvi().compareTo(BigDecimal.ONE) > 0)
                throw new IllegalArgumentException("NDVI deve estar entre -1 e 1.");
        } else {
            if (dado.getNdvi() != null) throw new IllegalArgumentException("Dado CLIMA não deve conter NDVI.");
            if (dado.getPrecipitacaoMm() == null && dado.getTempMin() == null && dado.getTempMax() == null)
                throw new IllegalArgumentException("Dado CLIMA deve conter precipitação ou temperatura.");
            if (dado.getPrecipitacaoMm() != null && dado.getPrecipitacaoMm().compareTo(ZERO) < 0)
                throw new IllegalArgumentException("Precipitação não pode ser negativa.");
            if ((dado.getTempMin() != null && foraTemperatura(dado.getTempMin())) || (dado.getTempMax() != null && foraTemperatura(dado.getTempMax())))
                throw new IllegalArgumentException("Temperatura deve estar entre " + minTemp.toPlainString() + " e " + maxTemp.toPlainString() + "°C.");
            if (dado.getTempMin() != null && dado.getTempMax() != null && dado.getTempMin().compareTo(dado.getTempMax()) > 0)
                throw new IllegalArgumentException("Temperatura mínima não pode exceder a máxima.");
        }
    }

    public LocalDateTime normalizarDataHoraUtc(String valor) {
        if (valor == null || valor.isBlank()) return LocalDateTime.now(Clock.systemUTC());
        try {
            return OffsetDateTime.parse(valor).withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime();
        } catch (DateTimeParseException ignorada) {
            try { return LocalDateTime.parse(valor); }
            catch (DateTimeParseException erro) {
                throw new IllegalArgumentException("dataHora deve ser ISO-8601 local ou incluir um offset.");
            }
        }
    }

    public String normalizarOrigem(String origem) {
        String resultado = origem == null || origem.isBlank() ? "API" : origem.trim();
        if (resultado.length() > 40) throw new IllegalArgumentException("Origem deve ter no máximo 40 caracteres.");
        return resultado;
    }

    private boolean foraTemperatura(BigDecimal valor) {
        return valor.compareTo(minTemp) < 0 || valor.compareTo(maxTemp) > 0;
    }
}
