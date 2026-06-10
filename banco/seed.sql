-- ============================================================
-- AgroSat - Dados de demonstração (espelha o DataLoader.java)
-- Senha "123456" -> SHA-256 abaixo.
-- ============================================================

INSERT INTO produtores (nome, email, telefone, senha_hash, criado_em) VALUES
    ('João da Silva', 'joao@agrosat.com.br', '(14) 99999-0001',
     '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', CURRENT_TIMESTAMP);

INSERT INTO culturas (nome) VALUES ('Soja'), ('Milho');

INSERT INTO propriedades (nome, localizacao, area_hectares, produtor_id, cultura_id, criado_em) VALUES
    ('Fazenda Esperança', 'Lat: -22.85, Long: -48.43 — Botucatu/SP', 120.50, 1, 1, CURRENT_TIMESTAMP);

-- Sensores de umidade do solo (abaixo de 20% -> sinaliza seca)
INSERT INTO sensores (tipo, valor, data_hora, propriedade_id) VALUES
    ('UMIDADE_SOLO', 18.50, DATEADD('MINUTE', -30, CURRENT_TIMESTAMP), 1),
    ('UMIDADE_SOLO', 17.20, DATEADD('MINUTE', -60, CURRENT_TIMESTAMP), 1),
    ('UMIDADE_SOLO', 19.10, DATEADD('MINUTE', -90, CURRENT_TIMESTAMP), 1);

-- NDVI em queda (0.65 -> 0.41 em 7 dias -> indício de praga/estresse)
INSERT INTO dados_satelite (tipo, ndvi, precipitacao_mm, temp_min, temp_max, data_coleta, propriedade_id) VALUES
    ('NDVI', 0.650, NULL, NULL, NULL, DATEADD('DAY', -7, CURRENT_DATE), 1),
    ('NDVI', 0.580, NULL, NULL, NULL, DATEADD('DAY', -5, CURRENT_DATE), 1),
    ('NDVI', 0.470, NULL, NULL, NULL, DATEADD('DAY', -3, CURRENT_DATE), 1),
    ('NDVI', 0.420, NULL, NULL, NULL, DATEADD('DAY', -1, CURRENT_DATE), 1),
    ('NDVI', 0.410, NULL, NULL, NULL, CURRENT_DATE, 1);

-- Clima (precipitação acumulada muito baixa nos últimos 15 dias)
INSERT INTO dados_satelite (tipo, ndvi, precipitacao_mm, temp_min, temp_max, data_coleta, propriedade_id) VALUES
    ('CLIMA', NULL, 2.50, 22.00, 32.50, DATEADD('DAY', -5, CURRENT_DATE), 1),
    ('CLIMA', NULL, 0.00, 23.00, 33.00, DATEADD('DAY', -3, CURRENT_DATE), 1),
    ('CLIMA', NULL, 0.50, 24.00, 31.50, DATEADD('DAY', -1, CURRENT_DATE), 1),
    ('CLIMA', NULL, 0.00, 22.50, 32.00, CURRENT_DATE, 1);
