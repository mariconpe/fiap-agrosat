package br.com.fiap.agrosat.controller;

import br.com.fiap.agrosat.dto.AlertaResponse;
import br.com.fiap.agrosat.service.AlertaService;
import br.com.fiap.agrosat.service.RiscoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alertas")
@Tag(name = "Alertas")
public class AlertaController {

    private final AlertaService alertaService;
    private final RiscoService riscoService;

    public AlertaController(AlertaService alertaService,
                             RiscoService riscoService) {
        this.alertaService = alertaService;
        this.riscoService = riscoService;
    }

    @GetMapping
    @Operation(summary = "Listar todos os alertas de uma propriedade")
    public ResponseEntity<List<AlertaResponse>> listar(
            @RequestParam Long propriedadeId) {
        return ResponseEntity.ok(
                alertaService.listarPorPropriedade(propriedadeId));
    }

    @PutMapping("/{id}/lida")
    @Operation(summary = "Marcar alerta como lido")
    public ResponseEntity<AlertaResponse> marcarComoLida(
            @PathVariable Long id) {
        return ResponseEntity.ok(alertaService.marcarComoLida(id));
    }

    @PostMapping("/verificar")
    @Operation(summary = "Executar verificação de riscos (seca e praga)")
    public ResponseEntity<Map<String, Object>> verificarRiscos(
            @RequestParam Long propriedadeId) {
        List<AlertaResponse> gerados = riscoService.verificarRiscos(propriedadeId);
        return ResponseEntity.ok(Map.of(
                "propriedadeId", propriedadeId,
                "alertasGerados", gerados.size(),
                "alertas", gerados
        ));
    }
}
