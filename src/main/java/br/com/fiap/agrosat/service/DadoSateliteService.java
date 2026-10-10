package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.DadoSateliteRequest;
import br.com.fiap.agrosat.dto.DadoSateliteResponse;
import br.com.fiap.agrosat.model.DadoSatelite;
import br.com.fiap.agrosat.model.Propriedade;
import br.com.fiap.agrosat.repository.DadoSateliteRepository;
import br.com.fiap.agrosat.repository.PropriedadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.fiap.agrosat.model.enums.TipoDadoSatelite;
import java.util.List;

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
        String origem = processamentoService.normalizarOrigem(request.getOrigem());
        dado.setOrigem(origem);
        boolean duplicado = repository.findByPropriedade_IdAndTipoAndDataColeta(
                propriedade.getId(), request.getTipo(), request.getDataColeta()).stream().anyMatch(existente ->
                decimalIgual(existente.getNdvi(), dado.getNdvi())
                        && decimalIgual(existente.getPrecipitacaoMm(), dado.getPrecipitacaoMm())
                        && decimalIgual(existente.getTempMin(), dado.getTempMin())
                        && decimalIgual(existente.getTempMax(), dado.getTempMax())
                        && java.util.Objects.equals(existente.getOrigem(), origem));
        if (duplicado) dado.setValidacao("DUPLICADO");

        DadoSatelite salvo = repository.save(dado);
        riscoService.verificarRiscos(propriedade.getId());
        return DadoSateliteResponse.fromEntity(salvo);
    }

    @Transactional(readOnly = true)
    public List<DadoSateliteResponse> historicoNdvi(Long propriedadeId) {
        propriedadeRepository.findById(propriedadeId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Propriedade", propriedadeId));
        return repository.findByPropriedade_IdAndTipoOrderByDataColetaAscIdAsc(propriedadeId, TipoDadoSatelite.NDVI)
                .stream().map(DadoSateliteResponse::fromEntity).toList();
    }

    private boolean decimalIgual(java.math.BigDecimal a, java.math.BigDecimal b) {
        return a == null ? b == null : b != null && a.compareTo(b) == 0;
    }
}
