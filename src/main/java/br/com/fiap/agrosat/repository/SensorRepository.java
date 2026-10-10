package br.com.fiap.agrosat.repository;

import br.com.fiap.agrosat.model.Sensor;
import br.com.fiap.agrosat.model.enums.TipoSensor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SensorRepository extends JpaRepository<Sensor, Long> {
    List<Sensor> findByPropriedade_IdOrderByDataHoraDesc(Long propriedadeId);
    Optional<Sensor> findTopByPropriedade_IdAndTipoOrderByDataHoraDescIdDesc(Long propriedadeId, TipoSensor tipo);
    List<Sensor> findByPropriedade_IdAndTipoOrderByDataHoraAsc(Long propriedadeId, TipoSensor tipo);
    List<Sensor> findByPropriedade_IdOrderByDataHoraDescIdDesc(Long propriedadeId);
}
