import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { Ticket } from "@/types/interfaces";

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
    const [rows] = await pool.query<Ticket[]>(
      `SELECT num_chamado, categoria, setor, status_ocorrencia, data_hora_ocorrencia 
       FROM tbl_ocorrencia 
       WHERE id_user = ? 
       ORDER BY data_hora_ocorrencia DESC`,
      [id],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar chamados:", error);
    res.status(500).json({ erro: "Erro ao buscar chamados" });
  }
}
