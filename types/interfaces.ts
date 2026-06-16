import { RowDataPacket } from "mysql2";

// Interface para o arquivo index.ts na pasta Usuario
export interface MeuChamado {
  num_chamado: string;
  categoria: string;
  setor: string;
  status_ocorrencia: string;
  data_hora_ocorrencia: string;
}

// Interface para o arquivo index.ts na pasta ServiceDesk
export interface ChamadoSD extends RowDataPacket {
  num_chamado: string;
  categoria: string;
  setor: string;
  status_ocorrencia: string;
  data_hora_ocorrencia: string;
  nome_user: string;
  sobrenome_user: string;
  descricao: string;
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
  disabled?: boolean;
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

// Interface para o arquivo dentro da pasta API > desk-tickets > detalhes-chamado.ts
export interface DetalhesChamado extends RowDataPacket {
  id_ocorrencia: number;
  num_chamado: string;
  categoria: string;
  nome_user: string;
  sobrenome_user: string;
  email_user: string;
  telefone: string;
  username: string;
  setor: string;
  descricao: string;
  anexo: string;
  status_ocorrencia: string;
  prioridade: string;
  data_hora_ocorrencia: string;
  data_hora_conclusao: string;
  username_tecnico: string;
  nome_tecnico: string;
  sobrenome_tecnico: string;
}

// Interfaces para as manifestações API > Registro-sd > Manifestacao ...
// manifestacao.ts
export interface Manifestacao extends RowDataPacket {
  id_manifestacao: number;
  codigo: string;
  descricao: string;
}

// grupo-manifestacao.ts
export interface GrupoManifestacao extends RowDataPacket {
  id_grupo: number;
  codigo: string;
  descricao: string;
}

// tipo-manifestacao.ts
export interface TipoManifestacao extends RowDataPacket {
  id_tipo: number;
  id_grupo: number;
  codigo: string;
  descricao: string;
}

// status-sd.ts
export interface StatusSD extends RowDataPacket {
  id_status: number;
  codigo: string;
  descricao: string;
}

// Interface para visualizar os registros realizados (API > desk-tickets > meus-registros.ts)
export interface MeusRegistros extends RowDataPacket {
  id_atendimento: number;
  num_chamado: string;
  login_tecnico: string;
  manifestacao: string;
  grupo_manifestacao: string;
  tipo_manifestacao: string;
  comentario: string;
  status: string;
  data_hora_atendimento: string;
}

// Interface para o banco comentarios
export interface Comentario {
  id_comentario: number;
  id_atendimento: number;
  id_tecnico: number;
  login_tecnico: string;
  comentario: string;
  status: string;
  data_hora_comentario: string;
}

// Interface para os anexos dos chamados
export interface Anexo {
  id_anexo: number;
  id_ocorrencia: number;
  nome_original: string;
  nome_salvo: string;
  caminho: string;
  tipo_mime: string;
  tamanho_bytes: number;
  data_upload: string;
}
