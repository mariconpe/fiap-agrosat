package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.SensorRequest;
import br.com.fiap.agrosat.dto.SensorResponse;
import br.com.fiap.agrosat.model.Propriedade;
import br.com.fiap.agrosat.model.Sensor;
import br.com.fiap.agrosat.repository.PropriedadeRepository;
import br.com.fiap.agrosat.repository.SensorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SensorService {

    private final SensorRepository repository;
    private final PropriedadeRepository propriedadeRepository;
    private final RiscoService riscoService;
    private final ProcessamentoService processamentoService;

    public SensorService(SensorRepository repository,
                         PropriedadeRepository propriedadeRepository, RiscoService riscoService, ProcessamentoService processamentoService) {
        this.repository = repository;
        this.propriedadeRepository = propriedadeRepository;
        this.riscoService = riscoService;
        this.processamentoService = processamentoService;
    }

    public SensorResponse registrarLeitura(SensorRequest request) {
        Propriedade propriedade = propriedadeRepository.findById(request.getPropriedadeId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Propriedade", request.getPropriedadeId()));

        processamentoService.validarSensor(request.getTipo(), request.getValor());
        Sensor sensor = new Sensor(
                request.getTipo(),
                request.getValor(),
                processamentoService.normalizarDataHoraUtc(request.getDataHora()),
                processamentoService.normalizarOrigem(request.getOrigem()),
                propriedade
        );
        boolean duplicado = repository.existsByPropriedade_IdAndTipoAndValorAndDataHoraAndOrigem(
                propriedade.getId(), request.getTipo(), request.getValor(), sensor.getDataHora(), sensor.getOrigem());
        if (duplicado) sensor.setValidacao("DUPLICADO");

        Sensor salvo = repository.save(sensor);
        riscoService.verificarRiscos(propriedade.getId());
        return SensorResponse.fromEntity(salvo);
    }

    @Transactional(readOnly = true)
    public List<SensorResponse> listarPorPropriedade(Long propriedadeId) {
        return repository.findByPropriedade_IdOrderByDataHoraDescIdDesc(propriedadeId)
                .stream()
                .map(SensorResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Sensor> listarEntidades(Long propriedadeId) {
        return repository.findByPropriedade_IdOrderByDataHoraDescIdDesc(propriedadeId);
    }
}
