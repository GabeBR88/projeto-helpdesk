import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { registrarLog } from "@/lib/logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_status, codigo, descricao, ativo } = req.body;

  if (!id_status) return res.status(400).json({ erro: "ID obrigatório" });

  try {
    await pool.query(
      "UPDATE tbl_status_atendimento SET codigo = ?, descricao = ?, ativo = ? WHERE id_status = ?",
      [codigo, descricao, ativo, id_status],
    );

    const usuarioCookie = req.cookies.usuario;
    if (usuarioCookie) {
      const { id } = JSON.parse(usuarioCookie);
      await registrarLog(
        id,
        "atualizar_status",
        `Atualizou o status "${descricao}"`,
      );
    }

    res.status(200).json({ mensagem: "Status atualizado!" });
  } catch {
    res.status(500).json({ erro: "Erro ao atualizar" });
  }
}
