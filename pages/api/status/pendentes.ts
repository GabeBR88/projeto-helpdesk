import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { ChamadosPendentes } from "@/types/interfaces";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const [rows] = await pool.query<ChamadosPendentes[]>(
      "SELECT COUNT(*) AS total FROM tbl_ocorrencia WHERE status_ocorrencia = 'Pendente'",
    );
    res.status(200).json(rows[0].total);
  } catch (error) {
    console.error("Erro ao buscar chamados pendentes:", error);
    res.status(500).json({ erro: "Erro ao buscar chamados pendentes" });
  }
}
