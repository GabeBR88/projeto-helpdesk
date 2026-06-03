import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { StatusSD } from "@/types/interfaces";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const [rows] = await pool.query<StatusSD[]>(
      "SELECT id_status, codigo, descricao FROM tbl_status_atendimento WHERE ativo = 1 ORDER BY descricao",
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar status: ", error);
    res.status(500).json({ erro: "Erro ao buscar status" });
  }
}
