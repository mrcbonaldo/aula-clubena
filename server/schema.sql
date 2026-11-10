-- CRM de Leads: rode este arquivo inteiro no MySQL (cria banco, tabelas e seed)
SET NAMES utf8mb4; -- garante acentos corretos ao carregar o arquivo
CREATE DATABASE IF NOT EXISTS crm_leads CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crm_leads;

DROP TABLE IF EXISTS interacoes;
DROP TABLE IF EXISTS leads;

CREATE TABLE leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  telefone VARCHAR(30),
  empresa VARCHAR(120),
  origem ENUM('Instagram','Indicação','Site','WhatsApp','Outro') NOT NULL DEFAULT 'Outro',
  valor_estimado DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('Novo','Contato','Qualificado','Proposta','Ganho','Perdido') NOT NULL DEFAULT 'Novo',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Índices: acelera filtro por status e ordenação por data
  INDEX idx_leads_status (status),
  INDEX idx_leads_criado_em (criado_em)
);

CREATE TABLE interacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  anotacao TEXT NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Apagar o lead apaga suas anotações automaticamente
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

INSERT INTO leads (nome, email, telefone, empresa, origem, valor_estimado, status, criado_em) VALUES
('Ana Souza',      'ana@lojaflor.com',     '(11) 91111-1111', 'Loja Flor',        'Instagram', 3500.00,  'Novo',        NOW() - INTERVAL 9 DAY),
('Bruno Lima',     'bruno@techup.com',     '(21) 92222-2222', 'TechUp',           'Site',      12000.00, 'Contato',     NOW() - INTERVAL 8 DAY),
('Carla Mendes',   'carla@padariaboa.com', '(31) 93333-3333', 'Padaria Boa',      'Indicação', 2800.00,  'Qualificado', NOW() - INTERVAL 7 DAY),
('Diego Alves',    'diego@construmax.com', '(41) 94444-4444', 'Construmax',       'WhatsApp',  25000.00, 'Proposta',    NOW() - INTERVAL 6 DAY),
('Elisa Rocha',    'elisa@clinicavida.com','(51) 95555-5555', 'Clínica Vida',     'Indicação', 8000.00,  'Ganho',       NOW() - INTERVAL 5 DAY),
('Fábio Torres',   'fabio@autopecas.com',  '(61) 96666-6666', 'Auto Peças Torres','Site',      4500.00,  'Perdido',     NOW() - INTERVAL 5 DAY),
('Gabriela Nunes', 'gabi@studiog.com',     '(71) 97777-7777', 'Studio G',         'Instagram', 1500.00,  'Novo',        NOW() - INTERVAL 3 DAY),
('Henrique Costa', 'henrique@agrosul.com', '(81) 98888-8888', 'AgroSul',          'Outro',     18000.00, 'Ganho',       NOW() - INTERVAL 2 DAY),
('Isabela Ramos',  'isa@escolaviva.com',   '(85) 99999-9999', 'Escola Viva',      'WhatsApp',  6200.00,  'Contato',     NOW() - INTERVAL 1 DAY),
('João Pereira',   'joao@mercadinho.com',  '(92) 90000-0000', 'Mercadinho Pereira','Site',     3000.00,  'Qualificado', NOW());

INSERT INTO interacoes (lead_id, anotacao, criado_em) VALUES
(2, 'Primeira ligação: pediu orçamento por e-mail.', NOW() - INTERVAL 7 DAY),
(4, 'Reunião realizada, proposta enviada.',          NOW() - INTERVAL 4 DAY),
(5, 'Contrato assinado!',                            NOW() - INTERVAL 3 DAY);
