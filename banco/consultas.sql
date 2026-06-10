-- ============================================================
-- AgroSat - 3 consultas de exemplo
-- Rodam no H2 sobre schema.sql + seed.sql.
-- ============================================================


-- ------------------------------------------------------------
-- 1) Saúde da lavoura: último NDVI de cada propriedade,
--    classificado na escala de cores do dashboard.
--    (verde = saudável, amarelo = atenção, vermelho = crítico)
-- ------------------------------------------------------------
SELECT p.nome                         AS propriedade,
       d.ndvi,
       d.data_coleta,
       CASE
           WHEN d.ndvi >= 0.60 THEN 'SAUDAVEL'
           WHEN d.ndvi >= 0.40 THEN 'ATENCAO'
           ELSE 'CRITICO'
       END                            AS status_lavoura
FROM dados_satelite d
JOIN propriedades p ON p.id = d.propriedade_id
WHERE d.tipo = 'NDVI'
  AND d.data_coleta = (
        SELECT MAX(d2.data_coleta)
        FROM dados_satelite d2
        WHERE d2.tipo = 'NDVI'
          AND d2.propriedade_id = d.propriedade_id
  );


-- ------------------------------------------------------------
-- 2) Risco de seca por propriedade: cruza a última leitura de
--    umidade do solo com a precipitação acumulada em 15 dias.
--    Regra: umidade < 20% E precipitação acumulada < 10mm.
-- ------------------------------------------------------------
SELECT p.nome                                   AS propriedade,
       umid.ultima_umidade,
       COALESCE(chuva.precip_15d, 0)            AS precip_acumulada_15d,
       CASE
           WHEN umid.ultima_umidade < 20
                AND COALESCE(chuva.precip_15d, 0) < 10
           THEN 'RISCO DE SECA'
           ELSE 'OK'
       END                                       AS situacao
FROM propriedades p
LEFT JOIN (
    SELECT s.propriedade_id, s.valor AS ultima_umidade
    FROM sensores s
    WHERE s.tipo = 'UMIDADE_SOLO'
      AND s.data_hora = (
            SELECT MAX(s2.data_hora)
            FROM sensores s2
            WHERE s2.tipo = 'UMIDADE_SOLO'
              AND s2.propriedade_id = s.propriedade_id
      )
) umid ON umid.propriedade_id = p.id
LEFT JOIN (
    SELECT propriedade_id, SUM(precipitacao_mm) AS precip_15d
    FROM dados_satelite
    WHERE tipo = 'CLIMA'
      AND data_coleta >= DATEADD('DAY', -15, CURRENT_DATE)
    GROUP BY propriedade_id
) chuva ON chuva.propriedade_id = p.id;


-- ------------------------------------------------------------
-- 3) Alertas ativos (não lidos) por produtor e severidade.
--    Útil para a tela de Alertas do app.
--    Obs.: o seed não cria alertas; eles surgem após chamar
--    POST /api/alertas/verificar. Para testar, insira um exemplo:
--    INSERT INTO alertas (tipo, severidade, mensagem, data_criacao, lida, propriedade_id)
--    VALUES ('SECA','ALTA','Umidade do solo abaixo de 20%', CURRENT_TIMESTAMP, FALSE, 1);
-- ------------------------------------------------------------
SELECT pr.nome                AS produtor,
       p.nome                 AS propriedade,
       a.severidade,
       COUNT(*)               AS qtd_nao_lidos
FROM alertas a
JOIN propriedades p ON p.id = a.propriedade_id
JOIN produtores pr ON pr.id = p.produtor_id
WHERE a.lida = FALSE
GROUP BY pr.nome, p.nome, a.severidade
ORDER BY pr.nome,
         CASE a.severidade WHEN 'ALTA' THEN 1 WHEN 'MEDIA' THEN 2 ELSE 3 END;
