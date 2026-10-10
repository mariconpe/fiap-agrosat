package br.com.fiap.agrosat;

import br.com.fiap.agrosat.service.ProcessamentoCsvService;
import br.com.fiap.agrosat.service.ProcessamentoService;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ProcessamentoCsvServiceTest {
    @Test
    void arquivoProcessadoCorrespondeAoResultadoReproduzivelEmJava() throws Exception {
        ProcessamentoCsvService service = new ProcessamentoCsvService(new ProcessamentoService());
        String entrada = Files.readString(Path.of("data/raw/leituras_simuladas.csv"));
        String esperado = Files.readString(Path.of("data/processed/leituras_validadas.csv"));
        assertEquals(esperado, service.processar(entrada));
    }
}
