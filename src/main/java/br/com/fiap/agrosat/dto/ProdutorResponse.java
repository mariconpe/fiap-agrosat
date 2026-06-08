package br.com.fiap.agrosat.dto;

import br.com.fiap.agrosat.model.Produtor;

import java.time.LocalDateTime;

public class ProdutorResponse {

    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private LocalDateTime criadoEm;

    public static ProdutorResponse fromEntity(Produtor p) {
        ProdutorResponse dto = new ProdutorResponse();
        dto.id = p.getId();
        dto.nome = p.getNome();
        dto.email = p.getEmail();
        dto.telefone = p.getTelefone();
        dto.criadoEm = p.getCriadoEm();
        return dto;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getTelefone() { return telefone; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}
