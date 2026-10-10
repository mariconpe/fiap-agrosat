package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.DadoSateliteRequest;
import br.com.fiap.agrosat.dto.DadoSateliteResponse;
import br.com.fiap.agrosat.model.DadoSatelite;
import br.com.fiap.agrosat.model.Propriedade;
import br.com.fiap.agrosat.repository.DadoSateliteRepository;
import br.com.fiap.agrosat.repository.PropriedadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DadoSateliteService {

    private final DadoSateliteRepository repository;
    private final PropriedadeRepository propriedadeRepository;
    private final RiscoService riscoService;
    private final ProcessamentoService processamentoService;

    public DadoSateliteService(DadoSateliteRepository repository,
                               PropriedadeRepository propriedadeRepository, RiscoService riscoService, ProcessamentoService processamentoService) {
        this.repository = repository;
        this.propriedadeRepository = propriedadeRepository;
        this.riscoService = riscoService;
        this.processamentoService = processamentoService;
    }

    @Transactional
    public DadoSateliteResponse registrar(DadoSateliteRequest request) {
        Propriedade propriedade = propriedadeRepository.findById(request.getPropriedadeId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Propriedade", request.getPropriedadeId()));
        processamentoService.validarSatelite(request);

        DadoSatelite dado = new DadoSatelite(
                request.getTipo(),
                request.getNdvi(),
                request.getPrecipitacaoMm(),
                request.getTempMin(),
                request.getTempMax(),
                request.getDataColeta(),
                propriedade
        );

        DadoSatelite salvo = repository.save(dado);
        salvo.setOrigem(request.getOrigem() == null ? "API" : request.getOrigem());
        salvo = repository.save(salvo);
        riscoService.verificarRiscos(propriedade.getId());
        return DadoSateliteResponse.fromEntity(salvo);
    }
}
