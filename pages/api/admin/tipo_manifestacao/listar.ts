import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_grupo } = req.query;

  try {
    let query =
      "SELECT id_tipo, id_grupo, codigo, descricao, ativo FROM tbl_tipo_manifestacao";
    const params: (string | number)[] = [];

    if (id_grupo) {
      query += " WHERE id_grupo = ?";
      params.push(Number(id_grupo));
    }

    query += " ORDER BY descricao ASC";

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    res.status(200).json(rows);
  } catch {
    res.status(500).json({ erro: "Erro ao listar tipos" });
  }
}
