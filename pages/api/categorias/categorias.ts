import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { CategoriasUser } from "@/types/interfaces";

export default async function CategoriasUsuario(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const [rows] = await pool.query<CategoriasUser[]>(
      "SELECT id_categoria, codigo, descricao, grupo FROM tbl_categorias_ocorrencia WHERE ativo = 1",
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);

    return res.status(500).json({ erro: "Erro ao buscar categorias" });
  }
}
