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
import java.time.Clock;

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
        LocalDateTime agora = LocalDateTime.now(Clock.systemUTC());
        sensorRepository.save(new Sensor(TipoSensor.UMIDADE_SOLO,
                new BigDecimal("18.5"), agora.minusMinutes(30), fazenda));
        sensorRepository.save(new Sensor(TipoSensor.UMIDADE_SOLO,
                new BigDecimal("17.2"), agora.minusMinutes(60), fazenda));
        sensorRepository.save(new Sensor(TipoSensor.UMIDADE_SOLO,
                new BigDecimal("19.1"), agora.minusMinutes(90), fazenda));

        // ── Dados de satélite (NDVI) ──
        LocalDate hoje = LocalDate.now(Clock.systemUTC());
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

        // ── Cenário de controle: condições estáveis, sem alerta ──
        Propriedade controle = propriedadeRepository.save(new Propriedade(
                "Fazenda Modelo — Sem Risco",
                "Lat: -22.86, Long: -48.44 — Botucatu/SP",
                new BigDecimal("42.0"), produtor, soja));
        sensorRepository.save(new Sensor(TipoSensor.UMIDADE_SOLO, new BigDecimal("35.0"), agora, controle));
        dadoSateliteRepository.save(new DadoSatelite(TipoDadoSatelite.CLIMA, null,
                new BigDecimal("18.0"), new BigDecimal("20.0"), new BigDecimal("27.0"), hoje, controle));
        dadoSateliteRepository.save(new DadoSatelite(TipoDadoSatelite.NDVI,
                new BigDecimal("0.640"), null, null, null, hoje.minusDays(3), controle));
        dadoSateliteRepository.save(new DadoSatelite(TipoDadoSatelite.NDVI,
                new BigDecimal("0.635"), null, null, null, hoje, controle));

        // ── Cenário sem dados: respostas analíticas vazias/SEM_DADOS ──
        propriedadeRepository.save(new Propriedade(
                "Fazenda Modelo — Sem Dados",
                "Lat: -22.87, Long: -48.45 — Botucatu/SP",
                new BigDecimal("18.0"), produtor, milho));

        // ── Cenário insuficiente: NDVI isolado não pode disparar regra de praga ──
        Propriedade insuficiente = propriedadeRepository.save(new Propriedade(
                "Fazenda Modelo — Série Insuficiente",
                "Lat: -22.88, Long: -48.46 — Botucatu/SP",
                new BigDecimal("25.0"), produtor, soja));
        dadoSateliteRepository.save(new DadoSatelite(TipoDadoSatelite.CLIMA, null,
                new BigDecimal("0.0"), new BigDecimal("24.0"), new BigDecimal("35.0"), hoje, insuficiente));
        dadoSateliteRepository.save(new DadoSatelite(TipoDadoSatelite.NDVI,
                new BigDecimal("0.400"), null, null, null, hoje, insuficiente));

        log.info("Seed concluído — produtor: joao@agrosat.com.br / senha: 123456; cenários de risco, controle e dados insuficientes carregados");
    }
}
