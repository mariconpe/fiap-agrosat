package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.ProdutorRequest;
import br.com.fiap.agrosat.dto.ProdutorResponse;
import br.com.fiap.agrosat.model.Produtor;
import br.com.fiap.agrosat.repository.ProdutorRepository;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
public class ProdutorService {

    private final ProdutorRepository repository;

    public ProdutorService(ProdutorRepository repository) {
        this.repository = repository;
    }

    public ProdutorResponse cadastrar(ProdutorRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado: " + request.getEmail());
        }

        Produtor produtor = new Produtor(
                request.getNome(),
                request.getEmail(),
                request.getTelefone(),
                hashSenha(request.getSenha())
        );

        Produtor salvo = repository.save(produtor);
        return ProdutorResponse.fromEntity(salvo);
    }

    public ProdutorResponse buscarPorId(Long id) {
        Produtor p = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produtor", id));
        return ProdutorResponse.fromEntity(p);
    }

    private String hashSenha(String senha) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(senha.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro ao gerar hash da senha", e);
        }
    }
}
