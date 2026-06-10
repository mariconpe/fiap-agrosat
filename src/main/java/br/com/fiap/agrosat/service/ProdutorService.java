package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.ProdutorRequest;
import br.com.fiap.agrosat.dto.ProdutorResponse;
import br.com.fiap.agrosat.model.Produtor;
import br.com.fiap.agrosat.repository.ProdutorRepository;
import org.springframework.stereotype.Service;

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
                SenhaHash.gerar(request.getSenha())
        );

        Produtor salvo = repository.save(produtor);
        return ProdutorResponse.fromEntity(salvo);
    }

    public ProdutorResponse buscarPorId(Long id) {
        Produtor p = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produtor", id));
        return ProdutorResponse.fromEntity(p);
    }
}
