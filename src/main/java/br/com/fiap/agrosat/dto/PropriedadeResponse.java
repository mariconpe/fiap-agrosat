package br.com.fiap.agrosat.dto;

import br.com.fiap.agrosat.model.Propriedade;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PropriedadeResponse {

    private Long id;
    private String nome;
    private String localizacao;
    private BigDecimal areaHectares;
    private String cultura;
    private long alertasAtivos;
    private LocalDateTime criadoEm;

    public static PropriedadeResponse fromEntity(Propriedade p, long alertasAtivos) {
        PropriedadeResponse dto = new PropriedadeResponse();
        dto.id = p.getId();
        dto.nome = p.getNome();
        dto.localizacao = p.getLocalizacao();
        dto.areaHectares = p.getAreaHectares();
        dto.cultura = p.getCultura() != null ? p.getCultura().getNome() : null;
        dto.alertasAtivos = alertasAtivos;
        dto.criadoEm = p.getCriadoEm();
        return dto;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getLocalizacao() { return localizacao; }
    public BigDecimal getAreaHectares() { return areaHectares; }
    public String getCultura() { return cultura; }
    public long getAlertasAtivos() { return alertasAtivos; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}
