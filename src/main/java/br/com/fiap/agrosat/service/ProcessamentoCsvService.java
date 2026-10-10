package br.com.fiap.agrosat.service;

import br.com.fiap.agrosat.model.enums.TipoSensor;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

/** Parses the versioned sensor sample and writes auditable processing results. */
@Service
public class ProcessamentoCsvService {
    private final ProcessamentoService processamento;

    public ProcessamentoCsvService(ProcessamentoService processamento) {
        this.processamento = processamento;
    }

    public String processar(String csv) {
        String[] linhas = csv.strip().split("\\R");
        if (linhas.length == 0 || !linhas[0].equals("tipo,valor,dataHora,propriedadeId,origem"))
            throw new IllegalArgumentException("Cabeçalho CSV inválido.");

        List<String> saida = new ArrayList<>();
        saida.add("tipo,dataHoraOriginal,dataHoraUtc,valor,propriedadeId,origem,validacao");
        Set<String> vistos = new HashSet<>();
        for (int i = 1; i < linhas.length; i++) {
            if (linhas[i].isBlank()) continue;
            String[] colunas = linhas[i].split(",", -1);
            if (colunas.length != 5) throw new IllegalArgumentException("Linha CSV " + (i + 1) + " deve conter cinco colunas.");
            String tipo = colunas[0];
            String valor = colunas[1];
            String dataOriginal = colunas[2];
            String propriedade = colunas[3];
            String origem = colunas[4];
            String utc = "";
            String validacao;
            try {
                TipoSensor enumTipo = TipoSensor.valueOf(tipo);
                BigDecimal numero = new BigDecimal(valor);
                utc = processamento.normalizarDataHoraUtc(dataOriginal).toString();
                long propriedadeId = Long.parseLong(propriedade);
                if (propriedadeId <= 0) throw new IllegalArgumentException("propriedadeId deve ser positivo.");
                origem = processamento.normalizarOrigem(origem);
                processamento.validarSensor(enumTipo, numero);
                String chave = String.join("|", tipo, utc, numero.stripTrailingZeros().toPlainString(), propriedade, origem);
                validacao = vistos.add(chave) ? "VALIDO" : "DUPLICADO";
            } catch (RuntimeException e) {
                validacao = "INVALIDO:" + e.getMessage();
            }
            saida.add(String.join(",", csv(tipo), csv(dataOriginal), csv(utc), csv(valor), csv(propriedade), csv(origem), csv(validacao)));
        }
        return String.join("\n", saida) + "\n";
    }

    private String csv(String value) {
        String safe = value == null ? "" : value;
        return "\"" + safe.replace("\"", "\"\"") + "\"";
    }
}
