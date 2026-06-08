package br.com.fiap.agrosat.dto;

import br.com.fiap.agrosat.model.DadoSatelite;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DadoSateliteResponse {

    private Long id;
    private String tipo;
    private BigDecimal ndvi;
    private BigDecimal precipitacaoMm;
    private BigDecimal tempMin;
    private BigDecimal tempMax;
    private LocalDate dataColeta;
    private String propriedadeNome;

    public static DadoSateliteResponse fromEntity(DadoSatelite d) {
        DadoSateliteResponse r = new DadoSateliteResponse();
        r.id = d.getId();
        r.tipo = d.getTipo().name();
        r.ndvi = d.getNdvi();
        r.precipitacaoMm = d.getPrecipitacaoMm();
        r.tempMin = d.getTempMin();
        r.tempMax = d.getTempMax();
        r.dataColeta = d.getDataColeta();
        r.propriedadeNome = d.getPropriedade() != null
                ? d.getPropriedade().getNome() : null;
        return r;
    }

    public Long getId() { return id; }
    public String getTipo() { return tipo; }
    public BigDecimal getNdvi() { return ndvi; }
    public BigDecimal getPrecipitacaoMm() { return precipitacaoMm; }
    public BigDecimal getTempMin() { return tempMin; }
    public BigDecimal getTempMax() { return tempMax; }
    public LocalDate getDataColeta() { return dataColeta; }
    public String getPropriedadeNome() { return propriedadeNome; }
}
