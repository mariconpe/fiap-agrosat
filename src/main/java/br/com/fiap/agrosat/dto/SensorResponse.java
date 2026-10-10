package br.com.fiap.agrosat.dto;

import br.com.fiap.agrosat.model.Sensor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SensorResponse {

    private Long id;
    private String tipo;
    private BigDecimal valor;
    private LocalDateTime dataHora;
    private Long propriedadeId;
    private String origem;

    public static SensorResponse fromEntity(Sensor s) {
        SensorResponse dto = new SensorResponse();
        dto.id = s.getId();
        dto.tipo = s.getTipo().name();
        dto.valor = s.getValor();
        dto.dataHora = s.getDataHora();
        dto.propriedadeId = s.getPropriedadeId();
        dto.origem = s.getOrigem();
        return dto;
    }

    public Long getId() { return id; }
    public String getTipo() { return tipo; }
    public BigDecimal getValor() { return valor; }
    public LocalDateTime getDataHora() { return dataHora; }
    public Long getPropriedadeId() { return propriedadeId; }
    public String getOrigem() { return origem; }
}
