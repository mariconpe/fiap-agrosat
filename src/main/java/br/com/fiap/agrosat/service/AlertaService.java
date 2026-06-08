package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.AlertaResponse;
import br.com.fiap.agrosat.model.Alerta;
import br.com.fiap.agrosat.model.Propriedade;
import br.com.fiap.agrosat.model.enums.SeveridadeAlerta;
import br.com.fiap.agrosat.model.enums.TipoAlerta;
import br.com.fiap.agrosat.repository.AlertaRepository;
import br.com.fiap.agrosat.repository.PropriedadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlertaService {

    private final AlertaRepository repository;
    private final PropriedadeRepository propriedadeRepository;

    public AlertaService(AlertaRepository repository,
                         PropriedadeRepository propriedadeRepository) {
        this.repository = repository;
        this.propriedadeRepository = propriedadeRepository;
    }

    @Transactional(readOnly = true)
    public List<AlertaResponse> listarPorPropriedade(Long propriedadeId) {
        return repository.findByPropriedade_IdOrderByDataCriacaoDesc(propriedadeId)
                .stream()
                .map(AlertaResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlertaResponse> listarAtivos(Long propriedadeId) {
        return repository.findByPropriedade_IdAndLidaFalseOrderByDataCriacaoDesc(
                        propriedadeId)
                .stream()
                .map(AlertaResponse::fromEntity)
                .toList();
    }

    @Transactional
    public AlertaResponse marcarComoLida(Long id) {
        Alerta alerta = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Alerta", id));
        alerta.setLida(true);
        Alerta salvo = repository.save(alerta);
        return AlertaResponse.fromEntity(salvo);
    }

    /**
     * Cria um alerta e persiste.
     */
    @Transactional
    public AlertaResponse criarAlerta(Long propriedadeId, TipoAlerta tipo,
                                       SeveridadeAlerta severidade, String mensagem) {
        Propriedade propriedade = propriedadeRepository.findById(propriedadeId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Propriedade", propriedadeId));

        Alerta alerta = new Alerta(tipo, severidade, mensagem, propriedade);
        Alerta salvo = repository.save(alerta);
        return AlertaResponse.fromEntity(salvo);
    }
}
