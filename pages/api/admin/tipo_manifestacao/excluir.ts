import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { registrarLog } from "@/lib/logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_tipo } = req.body;
  if (!id_tipo) return res.status(400).json({ erro: "ID obrigatório" });

  try {
    await pool.query("DELETE FROM tbl_tipo_manifestacao WHERE id_tipo = ?", [
      id_tipo,
    ]);

    const usuarioCookie = req.cookies.usuario;
    if (usuarioCookie) {
      const { id } = JSON.parse(usuarioCookie);
      await registrarLog(id, "excluir_tipo", `Excluiu o tipo ID ${id_tipo}`);
    }

    res.status(200).json({ mensagem: "Tipo excluído com sucesso!" });
  } catch {
    res
      .status(500)
      .json({ erro: "Não é possível excluir. Este tipo está em uso." });
  }
}
