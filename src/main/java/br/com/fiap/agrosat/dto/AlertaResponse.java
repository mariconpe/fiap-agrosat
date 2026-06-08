package br.com.fiap.agrosat.dto;

import br.com.fiap.agrosat.model.Alerta;

import java.time.LocalDateTime;

public class AlertaResponse {

    private Long id;
    private String tipo;
    private String severidade;
    private String mensagem;
    private boolean lida;
    private LocalDateTime dataCriacao;
    private String propriedadeNome;

    public static AlertaResponse fromEntity(Alerta a) {
        AlertaResponse dto = new AlertaResponse();
        dto.id = a.getId();
        dto.tipo = a.getTipo().name();
        dto.severidade = a.getSeveridade().name();
        dto.mensagem = a.getMensagem();
        dto.lida = a.isLida();
        dto.dataCriacao = a.getDataCriacao();
        dto.propriedadeNome = a.getPropriedade() != null ? a.getPropriedade().getNome() : null;
        return dto;
    }

    public Long getId() { return id; }
    public String getTipo() { return tipo; }
    public String getSeveridade() { return severidade; }
    public String getMensagem() { return mensagem; }
    public boolean isLida() { return lida; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public String getPropriedadeNome() { return propriedadeNome; }
}
