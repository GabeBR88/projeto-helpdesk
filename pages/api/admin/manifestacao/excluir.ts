import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { registrarLog } from "@/lib/logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_manifestacao } = req.body;
  if (!id_manifestacao) return res.status(400).json({ erro: "ID obrigatório" });

  try {
    await pool.query("DELETE FROM tbl_manifestacao WHERE id_manifestacao = ?", [
      id_manifestacao,
    ]);

    const usuarioCookie = req.cookies.usuario;
    if (usuarioCookie) {
      const { id } = JSON.parse(usuarioCookie);
      await registrarLog(
        id,
        "excluir_manifestacao",
        `Excluiu a manifestação ID ${id_manifestacao}`,
      );
    }

    res.status(200).json({ mensagem: "Manifestação excluída com sucesso!" });
  } catch {
    res
      .status(500)
      .json({ erro: "Não é possível excluir. Esta manifestação está em uso." });
  }
}
