package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.dto.NdviResponse;
import br.com.fiap.agrosat.dto.PropriedadeRequest;
import br.com.fiap.agrosat.dto.PropriedadeResponse;
import br.com.fiap.agrosat.model.*;
import br.com.fiap.agrosat.model.enums.TipoDadoSatelite;
import br.com.fiap.agrosat.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PropriedadeService {

    private final PropriedadeRepository repository;
    private final ProdutorRepository produtorRepository;
    private final CulturaRepository culturaRepository;
    private final DadoSateliteRepository dadoSateliteRepository;
    private final AlertaRepository alertaRepository;

    public PropriedadeService(PropriedadeRepository repository,
                              ProdutorRepository produtorRepository,
                              CulturaRepository culturaRepository,
                              DadoSateliteRepository dadoSateliteRepository,
                              AlertaRepository alertaRepository) {
        this.repository = repository;
        this.produtorRepository = produtorRepository;
        this.culturaRepository = culturaRepository;
        this.dadoSateliteRepository = dadoSateliteRepository;
        this.alertaRepository = alertaRepository;
    }

    @Transactional(readOnly = true)
    public List<PropriedadeResponse> listar() {
        return repository.findAll().stream()
                .map(p -> PropriedadeResponse.fromEntity(p,
                        alertaRepository.countByPropriedade_IdAndLidaFalse(p.getId())))
                .toList();
    }

    public PropriedadeResponse cadastrar(PropriedadeRequest request) {
        Produtor produtor = produtorRepository.findById(request.getProdutorId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Produtor", request.getProdutorId()));

        Cultura cultura = null;
        if (request.getCulturaId() != null) {
            cultura = culturaRepository.findById(request.getCulturaId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Cultura", request.getCulturaId()));
        }

        Propriedade propriedade = new Propriedade(
                request.getNome(),
                request.getLocalizacao(),
                request.getAreaHectares(),
                produtor,
                cultura
        );

        Propriedade salva = repository.save(propriedade);
        return PropriedadeResponse.fromEntity(salva, 0);
    }

    @Transactional(readOnly = true)
    public PropriedadeResponse buscarPorId(Long id) {
        Propriedade p = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Propriedade", id));
        long alertasAtivos = alertaRepository.countByPropriedade_IdAndLidaFalse(id);
        return PropriedadeResponse.fromEntity(p, alertasAtivos);
    }

    @Transactional(readOnly = true)
    public NdviResponse consultarNdvi(Long propriedadeId) {
        // confirma que a propriedade existe
        repository.findById(propriedadeId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Propriedade", propriedadeId));

        DadoSatelite dado = dadoSateliteRepository
                .findTopByPropriedade_IdAndTipoOrderByDataColetaDesc(
                        propriedadeId, TipoDadoSatelite.NDVI)
                .orElse(null);

        if (dado == null || dado.getNdvi() == null) {
            return new NdviResponse(null, null, "SEM_DADOS");
        }

        BigDecimal ndvi = dado.getNdvi();
        String status;
        if (ndvi.compareTo(new BigDecimal("0.60")) >= 0) {
            status = "SAUDAVEL";
        } else if (ndvi.compareTo(new BigDecimal("0.30")) >= 0) {
            status = "ATENCAO";
        } else {
            status = "CRITICO";
        }

        return new NdviResponse(ndvi, dado.getDataColeta(), status);
    }
}
