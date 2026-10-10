package br.com.fiap.agrosat.model;

import br.com.fiap.agrosat.model.enums.TipoSensor;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensores")
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoSensor tipo;

    @Column(nullable = false, precision = 7, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(nullable = false, length = 40)
    private String origem = "API";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propriedade_id", nullable = false)
    private Propriedade propriedade;

    public Sensor() {}

    public Sensor(TipoSensor tipo, BigDecimal valor, LocalDateTime dataHora,
                  Propriedade propriedade) {
        this.tipo = tipo;
        this.valor = valor;
        this.dataHora = dataHora;
        this.propriedade = propriedade;
    }
    public Sensor(TipoSensor tipo, BigDecimal valor, LocalDateTime dataHora, String origem, Propriedade propriedade) {
        this(tipo, valor, dataHora, propriedade);
        this.origem = origem;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TipoSensor getTipo() { return tipo; }
    public void setTipo(TipoSensor tipo) { this.tipo = tipo; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
    public String getOrigem() { return origem; }
    public void setOrigem(String origem) { this.origem = origem; }

    public Propriedade getPropriedade() { return propriedade; }
    public void setPropriedade(Propriedade propriedade) { this.propriedade = propriedade; }

    public Long getPropriedadeId() {
        return propriedade != null ? propriedade.getId() : null;
    }
}
