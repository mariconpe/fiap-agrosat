package br.com.fiap.agrosat.repository;

import br.com.fiap.agrosat.model.Propriedade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropriedadeRepository extends JpaRepository<Propriedade, Long> {
    List<Propriedade> findByProdutor_Id(Long produtorId);
}
