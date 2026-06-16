import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { id_anexo } = req.query;

  if (!id_anexo) {
    return res.status(400).json({ erro: "ID do anexo é obrigatório" });
  }

  try {
    const [anexos] = await pool.query<RowDataPacket[]>(
      "SELECT caminho FROM tbl_anexos WHERE id_anexo = ?",
      [id_anexo],
    );

    if (anexos.length === 0) {
      return res.status(404).json({ erro: "Anexo não encontrado" });
    }

    // Redireciona para o arquivo (será baixado pelo navegador)
    res.redirect(anexos[0].caminho);
  } catch (error) {
    console.error("Erro ao baixar anexo:", error);
    res.status(500).json({ erro: "Erro ao baixar anexo" });
  }
}
