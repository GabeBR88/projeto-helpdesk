// pages/api/atendimentos/salvar.ts
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
  const { id_ocorrencia, manifestacao, grupo, tipo, comentario, status } =
    req.body;

  if (!id_ocorrencia || !manifestacao || !grupo || !status) {
    return res
      .status(400)
      .json({ erro: "Campos obrigatórios não preenchidos" });
  }

  try {
    // Busca IDs das tabelas auxiliares
    const [man] = await pool.query<RowDataPacket[]>(
      "SELECT id_manifestacao FROM tbl_manifestacao WHERE codigo = ?",
      [manifestacao],
    );
    if (!man[0]) return res.status(400).json({ erro: "Manifestação inválida" });

    const [grp] = await pool.query<RowDataPacket[]>(
      "SELECT id_grupo FROM tbl_grupo_manifestacao WHERE codigo = ?",
      [grupo],
    );
    if (!grp[0]) return res.status(400).json({ erro: "Grupo inválido" });

    let id_tipo = null;
    if (tipo) {
      const [tip] = await pool.query<RowDataPacket[]>(
        "SELECT id_tipo FROM tbl_tipo_manifestacao WHERE codigo = ?",
        [tipo],
      );
      id_tipo = tip[0]?.id_tipo || null;
    }

    // Insere o atendimento
    await pool.query(
      `INSERT INTO tbl_atendimentos 
       (id_ocorrencia, id_tecnico, id_manifestacao, id_grupo, id_tipo, comentario, status, data_hora_atendimento) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id_ocorrencia,
        id,
        man[0].id_manifestacao,
        grp[0].id_grupo,
        id_tipo,
        comentario || null,
        status,
      ],
    );

    // Atualiza a ocorrência
    if (status === "concluido") {
      await pool.query(
        `UPDATE tbl_ocorrencia 
         SET status_ocorrencia = 'Finalizado', data_hora_conclusao = NOW(), id_tecnico = ? 
         WHERE id_ocorrencia = ?`,
        [id, id_ocorrencia],
      );
    } else {
      await pool.query(
        `UPDATE tbl_ocorrencia 
         SET status_ocorrencia = 'Em andamento', id_tecnico = ? 
         WHERE id_ocorrencia = ?`,
        [id, id_ocorrencia],
      );
    }

    res.status(201).json({ mensagem: "Atendimento salvo com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar atendimento:", error);
    res.status(500).json({ erro: "Erro ao salvar atendimento" });
  }
}
