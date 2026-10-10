package br.com.fiap.agrosat.config;

import br.com.fiap.agrosat.service.ProcessamentoCsvService;
import java.nio.file.Files;
import java.nio.file.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "agrosat.csv.processar", havingValue = "true")
public class ProcessamentoCsvRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(ProcessamentoCsvRunner.class);
    private final ProcessamentoCsvService service;

    public ProcessamentoCsvRunner(ProcessamentoCsvService service) {
        this.service = service;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Path entrada = Path.of("data/raw/leituras_simuladas.csv");
        Path saida = Path.of("data/processed/leituras_validadas.csv");
        Files.createDirectories(saida.getParent());
        Files.writeString(saida, service.processar(Files.readString(entrada)));
        log.info("CSV processado por Java: {} -> {}", entrada, saida);
    }
}
