package br.com.fiap.agrosat.repository;

import br.com.fiap.agrosat.model.DadoSatelite;
import br.com.fiap.agrosat.model.enums.TipoDadoSatelite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DadoSateliteRepository extends JpaRepository<DadoSatelite, Long> {
    Optional<DadoSatelite> findTopByPropriedade_IdAndTipoOrderByDataColetaDesc(
            Long propriedadeId, TipoDadoSatelite tipo);

    List<DadoSatelite> findByPropriedade_IdAndTipoAndDataColetaAfterOrderByDataColetaAsc(
            Long propriedadeId, TipoDadoSatelite tipo, LocalDate data);

    List<DadoSatelite> findByPropriedade_IdAndDataColetaAfterOrderByDataColetaAsc(
            Long propriedadeId, LocalDate data);
}
