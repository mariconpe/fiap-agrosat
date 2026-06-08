package br.com.fiap.agrosat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class PropriedadeRequest {

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotBlank(message = "Localização é obrigatória")
    private String localizacao;

    @NotNull(message = "Área é obrigatória")
    @Positive(message = "Área deve ser positiva")
    private BigDecimal areaHectares;

    @NotNull(message = "ID do produtor é obrigatório")
    private Long produtorId;

    private Long culturaId;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getLocalizacao() { return localizacao; }
    public void setLocalizacao(String localizacao) { this.localizacao = localizacao; }

    public BigDecimal getAreaHectares() { return areaHectares; }
    public void setAreaHectares(BigDecimal areaHectares) { this.areaHectares = areaHectares; }

    public Long getProdutorId() { return produtorId; }
    public void setProdutorId(Long produtorId) { this.produtorId = produtorId; }

    public Long getCulturaId() { return culturaId; }
    public void setCulturaId(Long culturaId) { this.culturaId = culturaId; }
}
