package br.com.fiap.agrosat.service;

public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException(String recurso, Long id) {
        super(recurso + " não encontrado com id: " + id);
    }
}
