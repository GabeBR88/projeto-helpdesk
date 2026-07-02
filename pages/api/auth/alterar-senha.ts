import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_user, nova_senha } = req.body;

  if (!id_user || !nova_senha)
    return res.status(400).json({ erro: "Dados incompletos" });

  try {
    await pool.query(
      "UPDATE tbl_funcionarios SET senha_hash = ? WHERE id_user = ?",
      [nova_senha, id_user],
    );
    res.status(200).json({ mensagem: "Senha alterada com sucesso!" });
  } catch {
    res.status(500).json({ erro: "Erro ao alterar senha" });
  }
}
