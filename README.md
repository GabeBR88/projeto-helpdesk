# HelpDesk - Sistema de Chamados

Sistema completo de gerenciamento de chamados (help desk) desenvolvido com **Next.js**, **TypeScript**, **MySQL** e **Tailwind CSS**.

---

## Funcionalidades

### Tela Login

- Acesso através de Usuário e Senha
- Solicitação de reset de senha

### Perfil Usuário

- Abertura de chamados com upload de anexos
- Acompanhamento em tempo real do status
- Visualização do histórico completo de atendimento

### Perfil Service Desk

- Painel com cards indicativos (pendentes, atribuídos, redirecionados, fora do prazo, concluídos do dia, finalizados do dia)
- Atendimento de chamados com registro detalhado
- Redirecionamento entre técnicos
- Comentários adicionais nos registros
- Visualização de anexos enviados pelo usuário
- Histórico dos protocolos finalizados

### Perfil Administrador

- CRUD completo de usuários (com senha automática Nome123)
- CRUD de setores, status, manifestações, grupos e tipos
- Reset de senha com envio de e-mail automático
- Auditoria completa (tbl_logs)
- Gerenciamento de solicitações de reset

### Segurança

- Senhas criptografadas com bcrypt
- Proteção de rotas por perfil (proxy)
- Senha temporária com redirecionamento para criação
- Bloqueio de copiar/colar na criação de senha
- Validação de força de senha

---

## Tecnologias

| Tecnologia          | Uso                       |
| ------------------- | ------------------------- |
| **Next.js 16**      | Framework React com SSR   |
| **TypeScript**      | Tipagem estática          |
| **MySQL**           | Banco de dados relacional |
| **Tailwind CSS 4**  | Estilização               |
| **Bootstrap Icons** | Ícones                    |
| **bcryptjs**        | Criptografia de senhas    |
| **Nodemailer**      | Envio de e-mails          |
| **Multer**          | Upload de arquivos        |
| **UUID**            | Nomes únicos para anexos  |

---

## Instalação

### Pré-requisitos

- Node.js e npm
- MySQL em execução
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/GabeBR88/projeto-helpdesk
cd projeto-helpdesk
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

O arquivo [database/schema.sql](database/schema.sql) contém todas as tabelas necessárias. O script já cria o banco `db_helpdesk`.

**Via terminal:**

```bash
mysql -u root -p < database/schema.sql
```

### 4. Configure as variáveis de ambiente

Copie o [.env.example](.env.example) para `.env` e preencha:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=db_helpdesk

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=sua_senha_app
NEXT_PUBLIC_URL=http://localhost:3000
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

### 6. Primeiro acesso

- Acesse a aplicação em http://localhost:3000
- Crie usuários no painel administrativo
- Para redefinição de senha, o sistema utiliza a senha padrão `Nome123`

### 7. Perfis de Acesso

Perfil: usuario
Descrição: Usuário comum
Acesso: Abre chamados, acompanha status, solicita reset

Perfil: servicedesk
Descrição: Técnico de atendimento
Acesso: Atende chamados, redireciona, registra ocorrências

Perfil: administrador
Descrição: Administrador do sistema
Acesso: Gerencia usuários, setores, status, manifestações

### 8. Configuração de E-mail

Para o envio de e-mails (reset de senha), é necessário configurar uma senha de app do Gmail:

Acesse: https://myaccount.google.com/apppasswords

Gere uma senha para o app "HelpDesk"

Cole no `.env` em `EMAIL_PASS`

### Licença

Este projeto é para fins de portfólio.

Desenvolvido por Gabriel Brito de Oliveira
