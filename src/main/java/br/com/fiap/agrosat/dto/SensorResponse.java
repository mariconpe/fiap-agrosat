package br.com.fiap.agrosat.dto;

import br.com.fiap.agrosat.model.Sensor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public class SensorResponse {

    private Long id;
    private String tipo;
    private BigDecimal valor;
    private OffsetDateTime dataHora;
    private Long propriedadeId;
    private String origem;
    private String validacao;

    public static SensorResponse fromEntity(Sensor s) {
        SensorResponse dto = new SensorResponse();
        dto.id = s.getId();
        dto.tipo = s.getTipo().name();
        dto.valor = s.getValor();
        dto.dataHora = s.getDataHora().atOffset(ZoneOffset.UTC);
        dto.propriedadeId = s.getPropriedadeId();
        dto.origem = s.getOrigem();
        dto.validacao = s.getValidacao();
        return dto;
    }

    public Long getId() { return id; }
    public String getTipo() { return tipo; }
    public BigDecimal getValor() { return valor; }
    public OffsetDateTime getDataHora() { return dataHora; }
    public Long getPropriedadeId() { return propriedadeId; }
    public String getOrigem() { return origem; }
    public String getValidacao() { return validacao; }
}
