package br.com.fiap.agrosat.dto;

import br.com.fiap.agrosat.model.enums.TipoDadoSatelite;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DadoSateliteRequest {

    @NotNull(message = "Tipo é obrigatório")
    private TipoDadoSatelite tipo;

    private BigDecimal ndvi;

    private BigDecimal precipitacaoMm;

    private BigDecimal tempMin;

    private BigDecimal tempMax;

    @NotNull(message = "Data da coleta é obrigatória")
    private LocalDate dataColeta;

    @NotNull(message = "ID da propriedade é obrigatório")
    private Long propriedadeId;

    public TipoDadoSatelite getTipo() { return tipo; }
    public void setTipo(TipoDadoSatelite tipo) { this.tipo = tipo; }

    public BigDecimal getNdvi() { return ndvi; }
    public void setNdvi(BigDecimal ndvi) { this.ndvi = ndvi; }

    public BigDecimal getPrecipitacaoMm() { return precipitacaoMm; }
    public void setPrecipitacaoMm(BigDecimal precipitacaoMm) { this.precipitacaoMm = precipitacaoMm; }

    public BigDecimal getTempMin() { return tempMin; }
    public void setTempMin(BigDecimal tempMin) { this.tempMin = tempMin; }

    public BigDecimal getTempMax() { return tempMax; }
    public void setTempMax(BigDecimal tempMax) { this.tempMax = tempMax; }

    public LocalDate getDataColeta() { return dataColeta; }
    public void setDataColeta(LocalDate dataColeta) { this.dataColeta = dataColeta; }

    public Long getPropriedadeId() { return propriedadeId; }
    public void setPropriedadeId(Long propriedadeId) { this.propriedadeId = propriedadeId; }
}
