import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const usuarioCookie = req.cookies.usuario;
  if (!usuarioCookie) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  const { id_atendimento } = req.query;

  if (!id_atendimento) {
    return res.status(400).json({ erro: "ID do atendimento é obrigatório" });
  }

  try {
    const [comentarios] = await pool.query(
      `SELECT 
        c.id_comentario,
        c.id_atendimento,
        c.id_tecnico,
        f.username AS login_tecnico,
        c.comentario,
        c.status,
        c.data_hora_comentario
      FROM tbl_comentarios c
      INNER JOIN tbl_funcionarios f ON c.id_tecnico = f.id_user
      WHERE c.id_atendimento = ?
      ORDER BY c.data_hora_comentario ASC`,
      [id_atendimento],
    );

    res.status(200).json(comentarios);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    res.status(500).json({ erro: "Erro ao buscar comentários" });
  }
}
