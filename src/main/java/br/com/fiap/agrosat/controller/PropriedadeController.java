package br.com.fiap.agrosat.controller;

import br.com.fiap.agrosat.dto.*;
import br.com.fiap.agrosat.service.AlertaService;
import br.com.fiap.agrosat.service.PropriedadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/propriedades")
@Tag(name = "Propriedades", description = "Gerenciamento de propriedades rurais")
public class PropriedadeController {

    private final PropriedadeService service;
    private final AlertaService alertaService;

    public PropriedadeController(PropriedadeService service,
                                  AlertaService alertaService) {
        this.service = service;
        this.alertaService = alertaService;
    }

    @GetMapping
    @Operation(summary = "Listar todas as propriedades")
    public ResponseEntity<List<PropriedadeResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping
    @Operation(summary = "Cadastrar propriedade")
    public ResponseEntity<PropriedadeResponse> cadastrar(
            @Valid @RequestBody PropriedadeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.cadastrar(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar propriedade por ID")
    public ResponseEntity<PropriedadeResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/{id}/ndvi")
    @Operation(summary = "Consultar último índice NDVI da propriedade")
    public ResponseEntity<NdviResponse> consultarNdvi(@PathVariable Long id) {
        return ResponseEntity.ok(service.consultarNdvi(id));
    }

    @GetMapping("/{id}/alertas")
    @Operation(summary = "Listar alertas ativos da propriedade")
    public ResponseEntity<List<AlertaResponse>> listarAlertas(
            @PathVariable Long id) {
        return ResponseEntity.ok(alertaService.listarAtivos(id));
    }
}
