import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { GrupoManifestacao } from "@/types/interfaces";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const [rows] = await pool.query<GrupoManifestacao[]>(
      "SELECT id_grupo, codigo, descricao FROM tbl_grupo_manifestacao WHERE ativo = 1 ORDER BY descricao",
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar grupo de manifestacao: ", error);
    res.status(500).json({ erro: "Erro ao buscar grupo de manifestacao" });
  }
}
