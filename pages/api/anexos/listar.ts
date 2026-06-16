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

  const { id_ocorrencia } = req.query;

  if (!id_ocorrencia) {
    return res.status(400).json({ erro: "ID da ocorrência é obrigatório" });
  }

  try {
    const [anexos] = await pool.query<RowDataPacket[]>(
      `SELECT id_anexo, nome_original, nome_salvo, caminho, tipo_mime, tamanho_bytes, data_upload 
       FROM tbl_anexos 
       WHERE id_ocorrencia = ? 
       ORDER BY data_upload DESC`,
      [id_ocorrencia],
    );

    res.status(200).json(anexos);
  } catch (error) {
    console.error("Erro ao listar anexos:", error);
    res.status(500).json({ erro: "Erro ao listar anexos" });
  }
}
