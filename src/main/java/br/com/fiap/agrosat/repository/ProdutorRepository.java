package br.com.fiap.agrosat.repository;

import br.com.fiap.agrosat.model.Produtor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutorRepository extends JpaRepository<Produtor, Long> {
    boolean existsByEmail(String email);
}
