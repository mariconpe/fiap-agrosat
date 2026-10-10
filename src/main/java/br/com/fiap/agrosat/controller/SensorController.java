package br.com.fiap.agrosat.controller;

import br.com.fiap.agrosat.dto.DadoSateliteRequest;
import br.com.fiap.agrosat.dto.DadoSateliteResponse;
import br.com.fiap.agrosat.dto.SensorRequest;
import br.com.fiap.agrosat.dto.SensorResponse;
import br.com.fiap.agrosat.service.DadoSateliteService;
import br.com.fiap.agrosat.service.SensorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api")
@Tag(name = "Sensores")
public class SensorController {

    private final SensorService sensorService;
    private final DadoSateliteService dadoSateliteService;

    public SensorController(SensorService sensorService,
                            DadoSateliteService dadoSateliteService) {
        this.sensorService = sensorService;
        this.dadoSateliteService = dadoSateliteService;
    }

    @PostMapping("/sensores/dados")
    @Operation(summary = "Registrar leitura de sensor IoT")
    public ResponseEntity<SensorResponse> registrarLeitura(
            @Valid @RequestBody SensorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sensorService.registrarLeitura(request));
    }

    @GetMapping("/sensores")
    @Operation(summary = "Listar leituras de sensores por propriedade")
    public ResponseEntity<List<SensorResponse>> listarSensores(
            @RequestParam Long propriedadeId) {
        return ResponseEntity.ok(
                sensorService.listarPorPropriedade(propriedadeId));
    }

    @PostMapping("/dados-satelite")
    @Operation(summary = "Registrar dado de satélite (NDVI ou clima)")
    public ResponseEntity<DadoSateliteResponse> registrarDadoSatelite(
            @Valid @RequestBody DadoSateliteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(dadoSateliteService.registrar(request));
    }

    @GetMapping(value = "/dados/exportar", produces = "text/csv")
    @Operation(summary = "Exportar leituras processadas de uma propriedade em CSV")
    public ResponseEntity<String> exportar(@RequestParam Long propriedadeId) {
        StringBuilder csv = new StringBuilder("tipo,dataHoraUtc,valor,origem,validacao\n");
        sensorService.listarEntidades(propriedadeId).forEach(s -> {
            csv.append(s.getTipo()).append(',').append(s.getDataHora()).append(',').append(s.getValor()).append(',').append(s.getOrigem()).append(',').append(s.getValidacao()).append('\n');
        });
        return ResponseEntity.ok().contentType(MediaType.parseMediaType("text/csv; charset=utf-8")).body(csv.toString());
    }
}
