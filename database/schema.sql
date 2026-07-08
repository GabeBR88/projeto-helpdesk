-- ============================================
-- HELP DESK - Schema do Banco de Dados
-- ============================================

CREATE DATABASE IF NOT EXISTS db_helpdesk;
USE db_helpdesk;

-- ============================================
-- TABELA: Funcionários (Usuários do Sistema)
-- ============================================
CREATE TABLE tbl_funcionarios (
  id_user INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome_user VARCHAR(100) NOT NULL,
  sobrenome_user VARCHAR(100) NOT NULL,
  genero ENUM('M', 'F', 'Outro', 'Prefiro não informar') DEFAULT 'Prefiro não informar',
  email_user VARCHAR(255) NULL,
  telefone VARCHAR(20) NULL,
  perfil VARCHAR(50) NOT NULL DEFAULT 'usuario',
  username VARCHAR(50) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  ativo TINYINT(1) DEFAULT 1,
  data_cadastro TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id_user),
  UNIQUE KEY (username),
  UNIQUE KEY (email_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Setores da Empresa
-- ============================================
CREATE TABLE tbl_setores_empresa (
  id_setor INT NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  descricao VARCHAR(100) NOT NULL,
  ativo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_setor),
  UNIQUE KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Categorias de Ocorrência
-- ============================================
CREATE TABLE tbl_categorias_ocorrencia (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  descricao VARCHAR(100) NOT NULL,
  grupo VARCHAR(50) NULL,
  ativo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_categoria),
  UNIQUE KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Ocorrências (Chamados)
-- ============================================
CREATE TABLE tbl_ocorrencia (
  id_ocorrencia INT NOT NULL AUTO_INCREMENT,
  id_user INT UNSIGNED NOT NULL,
  num_chamado VARCHAR(10) NOT NULL,
  id_setor INT NOT NULL,
  id_categoria INT NOT NULL,
  descricao TEXT NULL,
  anexo VARCHAR(255) NULL,
  data_hora_ocorrencia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  prazo_final DATETIME NULL,
  data_hora_conclusao DATETIME NULL,
  status_ocorrencia VARCHAR(50) NOT NULL DEFAULT 'Pendente',
  prioridade VARCHAR(20) DEFAULT 'normal',
  id_tecnico INT UNSIGNED NULL,
  PRIMARY KEY (id_ocorrencia),
  FOREIGN KEY (id_user) REFERENCES tbl_funcionarios(id_user),
  FOREIGN KEY (id_setor) REFERENCES tbl_setores_empresa(id_setor),
  FOREIGN KEY (id_categoria) REFERENCES tbl_categorias_ocorrencia(id_categoria),
  FOREIGN KEY (id_tecnico) REFERENCES tbl_funcionarios(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Manifestação
-- ============================================
CREATE TABLE tbl_manifestacao (
  id_manifestacao INT NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  descricao VARCHAR(100) NOT NULL,
  ativo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_manifestacao),
  UNIQUE KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Grupo de Manifestação
-- ============================================
CREATE TABLE tbl_grupo_manifestacao (
  id_grupo INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_manifestacao INT NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  descricao VARCHAR(100) NOT NULL,
  ativo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_grupo),
  UNIQUE KEY (codigo),
  FOREIGN KEY (id_manifestacao) REFERENCES tbl_manifestacao(id_manifestacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Tipo de Manifestação
-- ============================================
CREATE TABLE tbl_tipo_manifestacao (
  id_tipo INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_grupo INT UNSIGNED NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  descricao VARCHAR(100) NOT NULL,
  ativo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_tipo),
  UNIQUE KEY (codigo),
  FOREIGN KEY (id_grupo) REFERENCES tbl_grupo_manifestacao(id_grupo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Status de Atendimento
-- ============================================
CREATE TABLE tbl_status_atendimento (
  id_status INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  descricao VARCHAR(100) NOT NULL,
  ativo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_status),
  UNIQUE KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Atendimentos (Registros)
-- ============================================
CREATE TABLE tbl_atendimentos (
  id_atendimento INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_ocorrencia INT NOT NULL,
  id_tecnico INT UNSIGNED NOT NULL,
  id_manifestacao INT NOT NULL,
  id_grupo INT UNSIGNED NOT NULL,
  id_tipo INT UNSIGNED NULL,
  comentario TEXT NULL,
  status VARCHAR(50) NOT NULL,
  data_hora_atendimento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_atendimento),
  FOREIGN KEY (id_ocorrencia) REFERENCES tbl_ocorrencia(id_ocorrencia),
  FOREIGN KEY (id_tecnico) REFERENCES tbl_funcionarios(id_user),
  FOREIGN KEY (id_manifestacao) REFERENCES tbl_manifestacao(id_manifestacao),
  FOREIGN KEY (id_grupo) REFERENCES tbl_grupo_manifestacao(id_grupo),
  FOREIGN KEY (id_tipo) REFERENCES tbl_tipo_manifestacao(id_tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Comentários
-- ============================================
CREATE TABLE tbl_comentarios (
  id_comentario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_atendimento INT UNSIGNED NOT NULL,
  id_tecnico INT UNSIGNED NOT NULL,
  comentario TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  data_hora_comentario DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_atendimento) REFERENCES tbl_atendimentos(id_atendimento),
  FOREIGN KEY (id_tecnico) REFERENCES tbl_funcionarios(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Anexos
-- ============================================
CREATE TABLE tbl_anexos (
  id_anexo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_ocorrencia INT NOT NULL,
  nome_original VARCHAR(255) NOT NULL,
  nome_salvo VARCHAR(255) NOT NULL,
  caminho VARCHAR(500) NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  tamanho_bytes INT UNSIGNED NOT NULL,
  data_upload DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_ocorrencia) REFERENCES tbl_ocorrencia(id_ocorrencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Redirecionamentos
-- ============================================
CREATE TABLE tbl_redirecionamentos (
  id_redirecionamento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_ocorrencia INT NOT NULL,
  id_tecnico_origem INT UNSIGNED NOT NULL,
  id_tecnico_destino INT UNSIGNED NOT NULL,
  comentario TEXT NULL,
  data_redirecionamento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_ocorrencia) REFERENCES tbl_ocorrencia(id_ocorrencia),
  FOREIGN KEY (id_tecnico_origem) REFERENCES tbl_funcionarios(id_user),
  FOREIGN KEY (id_tecnico_destino) REFERENCES tbl_funcionarios(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Solicitações de Reset
-- ============================================
CREATE TABLE tbl_solicitacoes_reset (
  id_solicitacao INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_user INT UNSIGNED NOT NULL,
  status ENUM('pendente', 'atendido') DEFAULT 'pendente',
  data_solicitacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atendimento DATETIME NULL,
  id_admin INT UNSIGNED NULL,
  FOREIGN KEY (id_user) REFERENCES tbl_funcionarios(id_user),
  FOREIGN KEY (id_admin) REFERENCES tbl_funcionarios(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Logs de Auditoria
-- ============================================
CREATE TABLE tbl_logs (
  id_log INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_admin INT UNSIGNED NOT NULL,
  acao VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  data_log DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_admin) REFERENCES tbl_funcionarios(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERTS BÁSICOS
-- ============================================

-- Admin padrão (senha: Admin123)
INSERT INTO tbl_funcionarios (nome_user, sobrenome_user, email_user, perfil, username, senha_hash, ativo) 
VALUES ('Admin', 'Sistema', 'admin@sistema.com', 'administrador', 'ADMIN', '$2a$10$hash_aqui', 1);