package br.com.fiap.agrosat.model;

import br.com.fiap.agrosat.model.enums.TipoDadoSatelite;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "dados_satelite")
public class DadoSatelite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoDadoSatelite tipo;

    @Column(precision = 5, scale = 3)
    private BigDecimal ndvi;

    @Column(name = "precipitacao_mm", precision = 7, scale = 2)
    private BigDecimal precipitacaoMm;

    @Column(name = "temp_min", precision = 5, scale = 2)
    private BigDecimal tempMin;

    @Column(name = "temp_max", precision = 5, scale = 2)
    private BigDecimal tempMax;

    @Column(name = "data_coleta", nullable = false)
    private LocalDate dataColeta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propriedade_id", nullable = false)
    private Propriedade propriedade;

    public DadoSatelite() {}

    public DadoSatelite(TipoDadoSatelite tipo, BigDecimal ndvi, BigDecimal precipitacaoMm,
                        BigDecimal tempMin, BigDecimal tempMax, LocalDate dataColeta,
                        Propriedade propriedade) {
        this.tipo = tipo;
        this.ndvi = ndvi;
        this.precipitacaoMm = precipitacaoMm;
        this.tempMin = tempMin;
        this.tempMax = tempMax;
        this.dataColeta = dataColeta;
        this.propriedade = propriedade;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TipoDadoSatelite getTipo() { return tipo; }
    public void setTipo(TipoDadoSatelite tipo) { this.tipo = tipo; }

    public BigDecimal getNdvi() { return ndvi; }
    public void setNdvi(BigDecimal ndvi) { this.ndvi = ndvi; }

    public BigDecimal getPrecipitacaoMm() { return precipitacaoMm; }
    public void setPrecipitacaoMm(BigDecimal precipitacaoMm) { this.precipitacaoMm = precipitacaoMm; }

    public BigDecimal getTempMin() { return tempMin; }
    public void setTempMin(BigDecimal tempMin) { this.tempMin = tempMin; }

    public BigDecimal getTempMax() { return tempMax; }
    public void setTempMax(BigDecimal tempMax) { this.tempMax = tempMax; }

    public LocalDate getDataColeta() { return dataColeta; }
    public void setDataColeta(LocalDate dataColeta) { this.dataColeta = dataColeta; }

    public Propriedade getPropriedade() { return propriedade; }
    public void setPropriedade(Propriedade propriedade) { this.propriedade = propriedade; }
}
