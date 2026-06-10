package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.LoginRequest;
import br.com.fiap.agrosat.dto.LoginResponse;
import br.com.fiap.agrosat.model.Produtor;
import br.com.fiap.agrosat.repository.ProdutorRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final ProdutorRepository repository;

    public AuthService(ProdutorRepository repository) {
        this.repository = repository;
    }

    /**
     * Autentica o produtor comparando o hash SHA-256 da senha informada
     * com o hash armazenado. Mensagem de erro genérica para não revelar
     * se o email existe na base.
     */
    public LoginResponse autenticar(LoginRequest request) {
        Produtor produtor = repository.findByEmail(request.getEmail())
                .orElseThrow(CredenciaisInvalidasException::new);

        String hashInformado = SenhaHash.gerar(request.getSenha());
        if (!hashInformado.equals(produtor.getSenhaHash())) {
            throw new CredenciaisInvalidasException();
        }

        return LoginResponse.fromEntity(produtor);
    }
}
