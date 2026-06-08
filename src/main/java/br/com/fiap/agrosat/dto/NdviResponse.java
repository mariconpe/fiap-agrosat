package br.com.fiap.agrosat.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class NdviResponse {

    private BigDecimal ndvi;
    private LocalDate dataColeta;
    private String status;

    public NdviResponse(BigDecimal ndvi, LocalDate dataColeta, String status) {
        this.ndvi = ndvi;
        this.dataColeta = dataColeta;
        this.status = status;
    }

    public BigDecimal getNdvi() { return ndvi; }
    public LocalDate getDataColeta() { return dataColeta; }
    public String getStatus() { return status; }
}
