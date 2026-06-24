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
      "SELECT id_grupo, id_manifestacao, codigo, descricao, ativo FROM tbl_grupo_manifestacao ORDER BY descricao ASC",
    );
    res.status(200).json(rows);
  } catch {
    res.status(500).json({ erro: "Erro ao listar grupos" });
  }
}
