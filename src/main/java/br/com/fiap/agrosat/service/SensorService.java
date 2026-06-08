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

    public SensorService(SensorRepository repository,
                         PropriedadeRepository propriedadeRepository) {
        this.repository = repository;
        this.propriedadeRepository = propriedadeRepository;
    }

    public SensorResponse registrarLeitura(SensorRequest request) {
        Propriedade propriedade = propriedadeRepository.findById(request.getPropriedadeId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Propriedade", request.getPropriedadeId()));

        Sensor sensor = new Sensor(
                request.getTipo(),
                request.getValor(),
                LocalDateTime.now(),
                propriedade
        );

        Sensor salvo = repository.save(sensor);
        return SensorResponse.fromEntity(salvo);
    }

    @Transactional(readOnly = true)
    public List<SensorResponse> listarPorPropriedade(Long propriedadeId) {
        return repository.findByPropriedade_IdOrderByDataHoraDesc(propriedadeId)
                .stream()
                .map(SensorResponse::fromEntity)
                .toList();
    }
}
