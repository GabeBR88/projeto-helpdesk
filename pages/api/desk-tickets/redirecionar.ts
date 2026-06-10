import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const usuarioCookie = req.cookies.usuario;
  if (!usuarioCookie) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  const { id } = JSON.parse(usuarioCookie);
  const {
    id_ocorrencia,
    id_tecnico_destino,
    username_origem,
    username_destino,
  } = req.body;

  if (!id_ocorrencia || !id_tecnico_destino) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  try {
    const comentario = `Chamado redirecionado do técnico(a) ${username_origem} para o técnico(a) ${username_destino}`;

    // 1. Insere na tabela de redirecionamentos
    await pool.query(
      `INSERT INTO tbl_redirecionamentos 
       (id_ocorrencia, id_tecnico_origem, id_tecnico_destino, comentario) 
       VALUES (?, ?, ?, ?)`,
      [id_ocorrencia, id, id_tecnico_destino, comentario],
    );

    // 2. Busca os IDs para o registro automático no histórico
    const [man] = await pool.query<RowDataPacket[]>(
      "SELECT id_manifestacao FROM tbl_manifestacao WHERE codigo = 'redirecionado'",
    );
    const [grp] = await pool.query<RowDataPacket[]>(
      "SELECT id_grupo FROM tbl_grupo_manifestacao WHERE codigo = 'chamado_redirecionado'",
    );
    const [tip] = await pool.query<RowDataPacket[]>(
      "SELECT id_tipo FROM tbl_tipo_manifestacao WHERE codigo = 'redirecionado_tecnico'",
    );

    const id_manifestacao = man[0]?.id_manifestacao || 3;
    const id_grupo = grp[0]?.id_grupo || 12;
    const id_tipo = tip[0]?.id_tipo || 66;

    // 3. Insere o registro automático na tbl_atendimentos (aparece no histórico)
    await pool.query(
      `INSERT INTO tbl_atendimentos 
       (id_ocorrencia, id_tecnico, id_manifestacao, id_grupo, id_tipo, comentario, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'redirecionado')`,
      [id_ocorrencia, id, id_manifestacao, id_grupo, id_tipo, comentario],
    );

    // 4. Atualiza o técnico e status na ocorrência
    await pool.query(
      `UPDATE tbl_ocorrencia 
       SET id_tecnico = ?, status_ocorrencia = 'Em tratamento' 
       WHERE id_ocorrencia = ?`,
      [id_tecnico_destino, id_ocorrencia],
    );

    res.status(200).json({ mensagem: "Chamado redirecionado com sucesso!" });
  } catch (error) {
    console.error("Erro ao redirecionar:", error);
    res.status(500).json({ erro: "Erro ao redirecionar chamado" });
  }
}
