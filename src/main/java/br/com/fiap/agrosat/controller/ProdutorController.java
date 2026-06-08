package br.com.fiap.agrosat.controller;

import br.com.fiap.agrosat.dto.ProdutorRequest;
import br.com.fiap.agrosat.dto.ProdutorResponse;
import br.com.fiap.agrosat.service.ProdutorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/produtores")
@Tag(name = "Produtores")
public class ProdutorController {

    private final ProdutorService service;

    public ProdutorController(ProdutorService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Cadastrar produtor")
    public ResponseEntity<ProdutorResponse> cadastrar(
            @Valid @RequestBody ProdutorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.cadastrar(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar produtor por ID")
    public ResponseEntity<ProdutorResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }
}
