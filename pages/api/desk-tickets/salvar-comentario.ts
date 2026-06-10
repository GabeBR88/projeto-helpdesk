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
  const { id_atendimento, comentario, status } = req.body;

  if (!id_atendimento || !comentario || !status) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  try {
    // 1. Insere o comentário
    await pool.query(
      `INSERT INTO tbl_comentarios 
       (id_atendimento, id_tecnico, comentario, status) 
       VALUES (?, ?, ?, ?)`,
      [id_atendimento, id, comentario, status],
    );

    // 2. Atualiza o status na tbl_atendimentos
    await pool.query(
      `UPDATE tbl_atendimentos SET status = ? WHERE id_atendimento = ?`,
      [status, id_atendimento],
    );

    // 3. Busca o id_ocorrencia vinculado ao atendimento
    const [atendimento] = await pool.query<RowDataPacket[]>(
      `SELECT id_ocorrencia FROM tbl_atendimentos WHERE id_atendimento = ?`,
      [id_atendimento],
    );

    if (atendimento && atendimento.length > 0) {
      const id_ocorrencia = atendimento[0].id_ocorrencia;

      // 4. Se status for "concluido", atualiza a ocorrência
      if (status === "concluido") {
        await pool.query(
          `UPDATE tbl_ocorrencia 
           SET status_ocorrencia = 'Finalizado', 
               data_hora_conclusao = NOW() 
           WHERE id_ocorrencia = ?`,
          [id_ocorrencia],
        );
      }
    }

    res.status(200).json({ mensagem: "Comentário salvo com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar comentário:", error);
    res.status(500).json({ erro: "Erro ao salvar comentário" });
  }
}
