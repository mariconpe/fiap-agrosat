package br.com.fiap.agrosat.controller;

import br.com.fiap.agrosat.dto.LoginRequest;
import br.com.fiap.agrosat.dto.ProdutorResponse;
import br.com.fiap.agrosat.service.ProdutorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação")
public class AuthController {

    private final ProdutorService service;

    public AuthController(ProdutorService service) {
        this.service = service;
    }

    @PostMapping("/login")
    @Operation(summary = "Login do produtor (senha verificada por hash SHA-256)")
    public ResponseEntity<ProdutorResponse> login(@Valid @RequestBody LoginRequest request) {
        return service.autenticar(request.getEmail(), request.getSenha())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
