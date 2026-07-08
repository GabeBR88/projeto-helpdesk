import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { registrarLog } from "@/lib/logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_grupo } = req.body;
  if (!id_grupo) return res.status(400).json({ erro: "ID obrigatório" });

  try {
    await pool.query("DELETE FROM tbl_grupo_manifestacao WHERE id_grupo = ?", [
      id_grupo,
    ]);

    const usuarioCookie = req.cookies.usuario;
    if (usuarioCookie) {
      const { id } = JSON.parse(usuarioCookie);
      await registrarLog(id, "excluir_grupo", `Excluiu o grupo ID ${id_grupo}`);
    }

    res.status(200).json({ mensagem: "Grupo excluído com sucesso!" });
  } catch {
    res
      .status(500)
      .json({ erro: "Não é possível excluir. Este grupo está em uso." });
  }
}
