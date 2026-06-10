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

  const usuarioCookie = req.cookies.usuario;
  if (!usuarioCookie) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  const { id } = JSON.parse(usuarioCookie);

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM tbl_ocorrencia WHERE id_tecnico = ? AND status_ocorrencia = 'Em tratamento'",
      [id],
    );
    res.status(200).json(rows[0].total);
  } catch (error) {
    console.error("Erro ao buscar pendentes:", error);
    res.status(500).json({ erro: "Erro ao buscar pendentes" });
  }
}
