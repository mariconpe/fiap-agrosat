package br.com.fiap.agrosat.dto;

import br.com.fiap.agrosat.model.enums.TipoSensor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class SensorRequest {

    @NotNull(message = "Tipo do sensor é obrigatório")
    private TipoSensor tipo;

    @NotNull(message = "Valor é obrigatório")
    private BigDecimal valor;

    @NotNull(message = "ID da propriedade é obrigatório")
    private Long propriedadeId;
    @Size(max = 40, message = "Origem deve ter no máximo 40 caracteres")
    private String origem = "API";
    private String dataHora;

    public TipoSensor getTipo() { return tipo; }
    public void setTipo(TipoSensor tipo) { this.tipo = tipo; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public Long getPropriedadeId() { return propriedadeId; }
    public void setPropriedadeId(Long propriedadeId) { this.propriedadeId = propriedadeId; }
    public String getOrigem() { return origem; }
    public void setOrigem(String origem) { this.origem = origem; }
    public String getDataHora() { return dataHora; }
    public void setDataHora(String dataHora) { this.dataHora = dataHora; }
}
