package br.com.fiap.agrosat.repository;

import br.com.fiap.agrosat.model.Alerta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {
    List<Alerta> findByPropriedade_IdOrderByDataCriacaoDesc(Long propriedadeId);
    List<Alerta> findByPropriedade_IdAndLidaFalseOrderByDataCriacaoDesc(Long propriedadeId);
    long countByPropriedade_IdAndLidaFalse(Long propriedadeId);
}
