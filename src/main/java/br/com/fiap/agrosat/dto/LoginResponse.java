package br.com.fiap.agrosat.dto;

import br.com.fiap.agrosat.model.Produtor;

public class LoginResponse {

    private Long produtorId;
    private String nome;
    private String email;

    public LoginResponse(Long produtorId, String nome, String email) {
        this.produtorId = produtorId;
        this.nome = nome;
        this.email = email;
    }

    public static LoginResponse fromEntity(Produtor produtor) {
        return new LoginResponse(
                produtor.getId(),
                produtor.getNome(),
                produtor.getEmail()
        );
    }

    public Long getProdutorId() { return produtorId; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
}
