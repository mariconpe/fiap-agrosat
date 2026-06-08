package br.com.fiap.agrosat.repository;

import br.com.fiap.agrosat.model.Sensor;
import br.com.fiap.agrosat.model.enums.TipoSensor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SensorRepository extends JpaRepository<Sensor, Long> {
    List<Sensor> findByPropriedade_IdOrderByDataHoraDesc(Long propriedadeId);
    List<Sensor> findByPropriedade_IdAndTipo(Long propriedadeId, TipoSensor tipo);
}
