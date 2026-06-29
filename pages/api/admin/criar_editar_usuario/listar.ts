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
      `SELECT id_user, nome_user, sobrenome_user, genero, email_user, telefone, perfil, username, ativo, data_cadastro, ultimo_acesso 
       FROM tbl_funcionarios 
       ORDER BY nome_user ASC`,
    );
    res.status(200).json(rows);
  } catch {
    res.status(500).json({ erro: "Erro ao listar usuários" });
  }
}
