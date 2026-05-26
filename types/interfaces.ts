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

// Interface da estilização do botão props
export interface BotaoEstilizadoProps {
  icon: string; // Nome do ícone Bootstrap (ex: "bi bi-headset")
  texto: string; // Texto de dentro do botão (ex: "Abrir chamado")
  id: string;
  onClick?: () => void;
}

export interface BotaoPrincipalProps {
  icon: string;
  texto: string;
  tipo?: "submit" | "button" | "reset";
  onClick?: () => void;
}

// Intefaces das categorias que constam na pasta API > Categorias > categorias.ts
export interface CategoriasUser extends RowDataPacket {
  id_categoria: number;
  codigo: string;
  descricao: string;
  grupo: string;
}

// Intefaces das categorias que constam na pasta API > Setores > setores.ts
export interface Setor extends RowDataPacket {
  id_setor: number;
  codigo: string;
  descricao: string;
}

// Interface dos funcionários com perfil ServiceDesk que constam no banco de dados (API > sd-setor > st-setor.ts)
export interface SdSetor extends RowDataPacket {
  id_user: number;
  nome_user: string;
  sobrenome_user: string;
  perfi: string;
  username: string;
}

// Interface dos chamados com status pendente (API > status-chamado > status.ts)
export interface ChamadosPendentes extends RowDataPacket {
  total: number;
}

// Interface dos chamados com status pendente (API > status-chamado > fora-prazo.ts)
export interface ForaPrazo extends RowDataPacket {
  total: number;
}

// Interface dos chamados com status pendente (API > status-chamado > chamados-hoje.ts)
export interface ChamadosDoDia extends RowDataPacket {
  total: number;
}

// Interface dos chamados com status pendente (API > status-chamado > chamados-finalizados.ts)
export interface ChamadosFinalizados extends RowDataPacket {
  total: number;
}
