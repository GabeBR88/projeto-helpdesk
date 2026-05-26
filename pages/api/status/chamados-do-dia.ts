import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { ChamadosDoDia } from "@/types/interfaces";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const [rows] = await pool.query<ChamadosDoDia[]>(
      "SELECT COUNT(*) AS total FROM tbl_ocorrencia WHERE status_ocorrencia = 'Pendente' AND DATE(data_hora_ocorrencia) = CURDATE()",
    );
    res.status(200).json(rows[0].total);
  } catch (error) {
    console.error("Erro ao buscar chamados abertos hoje:", error);
    res.status(500).json({ erro: "Erro ao buscar chamados abertos hoje" });
  }
}
