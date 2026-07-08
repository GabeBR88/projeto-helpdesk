import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET")
    return res.status(405).json({ erro: "Método não permitido" });

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, f.nome_user, f.sobrenome_user, f.username, f.email_user,
       a.username AS admin_username, a.nome_user AS admin_nome
FROM tbl_solicitacoes_reset s
INNER JOIN tbl_funcionarios f ON s.id_user = f.id_user
LEFT JOIN tbl_funcionarios a ON s.id_admin = a.id_user
ORDER BY s.status ASC, s.data_solicitacao DESC`,
    );
    res.status(200).json(rows);
  } catch {
    res.status(500).json({ erro: "Erro ao listar solicitações" });
  }
}
