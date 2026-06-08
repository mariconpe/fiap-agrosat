package br.com.fiap.agrosat.repository;

import br.com.fiap.agrosat.model.Cultura;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CulturaRepository extends JpaRepository<Cultura, Long> {
}
