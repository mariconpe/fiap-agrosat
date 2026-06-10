package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.LoginRequest;
import br.com.fiap.agrosat.dto.LoginResponse;
import br.com.fiap.agrosat.model.Produtor;
import br.com.fiap.agrosat.repository.ProdutorRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;

@Service
public class AuthService {

    // hash sempre comparado quando o email não existe, para que a
    // resposta demore o mesmo tempo e não revele emails cadastrados
    private static final String HASH_FANTASMA = SenhaHash.gerar("senha-fantasma");

    private final ProdutorRepository repository;

    public AuthService(ProdutorRepository repository) {
        this.repository = repository;
    }

    /**
     * Autentica o produtor comparando o hash SHA-256 da senha informada
     * com o hash armazenado. Mensagem de erro genérica para não revelar
     * se o email existe na base; comparação em tempo constante.
     */
    public LoginResponse autenticar(LoginRequest request) {
        Optional<Produtor> produtor = repository.findByEmail(request.getEmail());
        String hashArmazenado = produtor
                .map(Produtor::getSenhaHash)
                .orElse(HASH_FANTASMA);

        String hashInformado = SenhaHash.gerar(request.getSenha());
        boolean senhaConfere = MessageDigest.isEqual(
                hashInformado.getBytes(StandardCharsets.UTF_8),
                hashArmazenado.getBytes(StandardCharsets.UTF_8));

        if (produtor.isEmpty() || !senhaConfere) {
            throw new CredenciaisInvalidasException();
        }

        return LoginResponse.fromEntity(produtor.get());
    }
}
