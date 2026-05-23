import { RowDataPacket } from "mysql2";

// Interface para o arquivo index.ts na pasta Usuario
export interface MeuChamado {
  num_chamado: string;
  categoria: string;
  setor: string;
  status_ocorrencia: string;
  data_hora_ocorrencia: string;
}

// Interface para o arquivo login.ts dentro da pasta API>Auth
export interface ValidarUsuario extends RowDataPacket {
  id_user: number;
  username: string;
  senha_hash: string;
  perfil: string;
}

// Interface para o arquivo profile.ts dentro da pasta API >desk-ticket
export interface PerfilUsuario extends RowDataPacket {
  nome_user: string;
  sobrenome_user: string;
  email_user: string;
  telefone: string;
  perfil: string;
}

// Interface para o arquivo meus-chamados-pendentes.ts dentro da pasta API >my-tickets
export interface Ticket extends RowDataPacket {
  num_chamado: string;
  categoria: string;
  setor: string;
  status_ocorrencia: string;
  data_hora_ocorrencia: string;
}
