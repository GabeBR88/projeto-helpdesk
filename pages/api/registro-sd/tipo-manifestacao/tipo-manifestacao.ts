import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { TipoManifestacao } from "@/types/interfaces";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { grupo } = req.query; // Pega o grupo da URL

  if (!grupo) {
    return res.status(400).json({ erro: "Grupo não informado" });
  }

  try {
    const [rows] = await pool.query<TipoManifestacao[]>(
      `SELECT t.id_tipo, t.id_grupo, t.codigo, t.descricao 
       FROM tbl_tipo_manifestacao t
       JOIN tbl_grupo_manifestacao g ON t.id_grupo = g.id_grupo
       WHERE g.codigo = ? AND t.ativo = 1 
       ORDER BY t.descricao`,
      [grupo],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar tipo de manifestação: ", error);
    res.status(500).json({ erro: "Erro ao buscar tipo de manifestação" });
  }
}
