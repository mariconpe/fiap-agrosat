package br.com.fiap.agrosat.dto;

import br.com.fiap.agrosat.model.enums.TipoSensor;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class SensorRequest {

    @NotNull(message = "Tipo do sensor é obrigatório")
    private TipoSensor tipo;

    @NotNull(message = "Valor é obrigatório")
    private BigDecimal valor;

    @NotNull(message = "ID da propriedade é obrigatório")
    private Long propriedadeId;

    public TipoSensor getTipo() { return tipo; }
    public void setTipo(TipoSensor tipo) { this.tipo = tipo; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public Long getPropriedadeId() { return propriedadeId; }
    public void setPropriedadeId(Long propriedadeId) { this.propriedadeId = propriedadeId; }
}
