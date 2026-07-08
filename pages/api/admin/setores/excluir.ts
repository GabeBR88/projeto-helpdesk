import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { registrarLog } from "@/lib/logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_setor } = req.body;
  if (!id_setor) return res.status(400).json({ erro: "ID obrigatório" });

  try {
    await pool.query("DELETE FROM tbl_setores_empresa WHERE id_setor = ?", [
      id_setor,
    ]);

    const usuarioCookie = req.cookies.usuario;
    if (usuarioCookie) {
      const { id } = JSON.parse(usuarioCookie);
      await registrarLog(id, "excluir_setor", `Excluiu o setor ID ${id_setor}`);
    }

    res.status(200).json({ mensagem: "Setor excluído com sucesso!" });
  } catch {
    res
      .status(500)
      .json({ erro: "Não é possível excluir. Este setor está em uso." });
  }
}
