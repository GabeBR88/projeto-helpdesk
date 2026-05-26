import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { Setor } from "@/types/interfaces";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const [rows] = await pool.query<Setor[]>(
      "SELECT id_setor, codigo, descricao FROM tbl_setores_empresa WHERE ativo = 1 ORDER BY descricao",
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar setores: ", error);
    res.status(500).json({ erro: "Erro ao buscar setores" });
  }
}
