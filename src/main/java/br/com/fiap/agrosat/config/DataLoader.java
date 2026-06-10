package br.com.fiap.agrosat.config;

import br.com.fiap.agrosat.model.*;
import br.com.fiap.agrosat.model.enums.TipoDadoSatelite;
import br.com.fiap.agrosat.model.enums.TipoSensor;
import br.com.fiap.agrosat.repository.*;
import br.com.fiap.agrosat.service.SenhaHash;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Popula o banco H2 com dados de demonstração ao iniciar a aplicação.
 */
@Configuration
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private final ProdutorRepository produtorRepository;
    private final PropriedadeRepository propriedadeRepository;
    private final CulturaRepository culturaRepository;
    private final SensorRepository sensorRepository;
    private final DadoSateliteRepository dadoSateliteRepository;

    public DataLoader(ProdutorRepository produtorRepository,
                      PropriedadeRepository propriedadeRepository,
                      CulturaRepository culturaRepository,
                      SensorRepository sensorRepository,
                      DadoSateliteRepository dadoSateliteRepository) {
        this.produtorRepository = produtorRepository;
        this.propriedadeRepository = propriedadeRepository;
        this.culturaRepository = culturaRepository;
        this.sensorRepository = sensorRepository;
        this.dadoSateliteRepository = dadoSateliteRepository;
    }

    @Override
    public void run(String... args) {
        if (produtorRepository.count() > 0) {
            log.info("Dados de seed já existem — pulando carga inicial.");
            return;
        }

        log.info("Carregando dados de demonstração...");

        // ── Produtor ──
        Produtor produtor = produtorRepository.save(new Produtor(
                "João da Silva",
                "joao@agrosat.com.br",
                "(14) 99999-0001",
                SenhaHash.gerar("123456")
        ));

        // ── Culturas ──
        Cultura soja = culturaRepository.save(new Cultura("Soja"));
        Cultura milho = culturaRepository.save(new Cultura("Milho"));

        // ── Propriedade ──
        Propriedade fazenda = propriedadeRepository.save(new Propriedade(
                "Fazenda Esperança",
                "Lat: -22.85, Long: -48.43 — Botucatu/SP",
                new BigDecimal("120.5"),
                produtor,
                soja
        ));

        // ── Sensores IoT ──
        LocalDateTime agora = LocalDateTime.now();
        sensorRepository.save(new Sensor(TipoSensor.UMIDADE_SOLO,
                new BigDecimal("18.5"), agora.minusMinutes(30), fazenda));
        sensorRepository.save(new Sensor(TipoSensor.UMIDADE_SOLO,
                new BigDecimal("17.2"), agora.minusMinutes(60), fazenda));
        sensorRepository.save(new Sensor(TipoSensor.UMIDADE_SOLO,
                new BigDecimal("19.1"), agora.minusMinutes(90), fazenda));

        // ── Dados de satélite (NDVI) ──
        LocalDate hoje = LocalDate.now();
        dadoSateliteRepository.save(new DadoSatelite(
                TipoDadoSatelite.NDVI,
                new BigDecimal("0.650"), null, null, null,
                hoje.minusDays(7), fazenda));
        dadoSateliteRepository.save(new DadoSatelite(
                TipoDadoSatelite.NDVI,
                new BigDecimal("0.580"), null, null, null,
                hoje.minusDays(5), fazenda));
        dadoSateliteRepository.save(new DadoSatelite(
                TipoDadoSatelite.NDVI,
                new BigDecimal("0.470"), null, null, null,
                hoje.minusDays(3), fazenda));
        dadoSateliteRepository.save(new DadoSatelite(
                TipoDadoSatelite.NDVI,
                new BigDecimal("0.420"), null, null, null,
                hoje.minusDays(1), fazenda));
        dadoSateliteRepository.save(new DadoSatelite(
                TipoDadoSatelite.NDVI,
                new BigDecimal("0.410"), null, null, null,
                hoje, fazenda));

        // ── Dados de satélite (Clima) ──
        dadoSateliteRepository.save(new DadoSatelite(
                TipoDadoSatelite.CLIMA,
                null, new BigDecimal("2.5"),
                new BigDecimal("22.0"), new BigDecimal("32.5"),
                hoje.minusDays(5), fazenda));
        dadoSateliteRepository.save(new DadoSatelite(
                TipoDadoSatelite.CLIMA,
                null, new BigDecimal("0.0"),
                new BigDecimal("23.0"), new BigDecimal("33.0"),
                hoje.minusDays(3), fazenda));
        dadoSateliteRepository.save(new DadoSatelite(
                TipoDadoSatelite.CLIMA,
                null, new BigDecimal("0.5"),
                new BigDecimal("24.0"), new BigDecimal("31.5"),
                hoje.minusDays(1), fazenda));
        dadoSateliteRepository.save(new DadoSatelite(
                TipoDadoSatelite.CLIMA,
                null, new BigDecimal("0.0"),
                new BigDecimal("22.5"), new BigDecimal("32.0"),
                hoje, fazenda));

        log.info("Seed concluído — produtor: joao@agrosat.com.br / senha: 123456");
    }
}
