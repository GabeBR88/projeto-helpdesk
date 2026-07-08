import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { registrarLog } from "@/lib/logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_setor, codigo, descricao, ativo } = req.body;

  if (!id_setor) return res.status(400).json({ erro: "ID obrigatório" });

  try {
    await pool.query(
      "UPDATE tbl_setores_empresa SET codigo = ?, descricao = ?, ativo = ? WHERE id_setor = ?",
      [codigo, descricao, ativo, id_setor],
    );

    const usuarioCookie = req.cookies.usuario;
    if (usuarioCookie) {
      const { id } = JSON.parse(usuarioCookie);
      await registrarLog(
        id,
        "atualizar_setor",
        `Atualizou o setor "${descricao}"`,
      );
    }

    res.status(200).json({ mensagem: "Setor atualizado!" });
  } catch {
    res.status(500).json({ erro: "Erro ao atualizar setor" });
  }
}
