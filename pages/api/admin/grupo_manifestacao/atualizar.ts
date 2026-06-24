import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_grupo, codigo, descricao, ativo } = req.body;
  if (!id_grupo) return res.status(400).json({ erro: "ID obrigatório" });

  try {
    await pool.query(
      "UPDATE tbl_grupo_manifestacao SET codigo = ?, descricao = ?, ativo = ? WHERE id_grupo = ?",
      [codigo, descricao, ativo, id_grupo],
    );
    res.status(200).json({ mensagem: "Grupo atualizado!" });
  } catch {
    res.status(500).json({ erro: "Erro ao atualizar" });
  }
}
