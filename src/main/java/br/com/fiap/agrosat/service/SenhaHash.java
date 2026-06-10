package br.com.fiap.agrosat.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Gera hash SHA-256 de senhas (bcrypt seria o ideal em produção —
 * SHA-256 atende o escopo acadêmico do protótipo).
 */
public final class SenhaHash {

    private SenhaHash() {
    }

    public static String gerar(String senha) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(senha.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro ao gerar hash da senha", e);
        }
    }
}
