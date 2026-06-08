package br.com.fiap.agrosat.model;

import br.com.fiap.agrosat.model.enums.SeveridadeAlerta;
import br.com.fiap.agrosat.model.enums.TipoAlerta;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "alertas")
public class Alerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoAlerta tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private SeveridadeAlerta severidade;

    @Column(nullable = false, length = 500)
    private String mensagem;

    @CreationTimestamp
    @Column(name = "data_criacao", updatable = false)
    private LocalDateTime dataCriacao;

    @Column(nullable = false)
    private boolean lida = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propriedade_id", nullable = false)
    private Propriedade propriedade;

    public Alerta() {}

    public Alerta(TipoAlerta tipo, SeveridadeAlerta severidade, String mensagem,
                  Propriedade propriedade) {
        this.tipo = tipo;
        this.severidade = severidade;
        this.mensagem = mensagem;
        this.propriedade = propriedade;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TipoAlerta getTipo() { return tipo; }
    public void setTipo(TipoAlerta tipo) { this.tipo = tipo; }

    public SeveridadeAlerta getSeveridade() { return severidade; }
    public void setSeveridade(SeveridadeAlerta severidade) { this.severidade = severidade; }

    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public boolean isLida() { return lida; }
    public void setLida(boolean lida) { this.lida = lida; }

    public Propriedade getPropriedade() { return propriedade; }
    public void setPropriedade(Propriedade propriedade) { this.propriedade = propriedade; }
}
