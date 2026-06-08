import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { SdSetor } from "@/types/interfaces";

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
    const [rows] = await pool.query<SdSetor[]>(
      "SELECT id_user, nome_user, sobrenome_user, perfil, username FROM tbl_funcionarios WHERE perfil = 'servicedesk' AND ativo = 1 AND id_user != ? ORDER BY nome_user ASC",
      [id],
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar funcionários Service Desk: ", error);
    res.status(500).json({ erro: "Erro ao buscar funcionários Service Desk" });
  }
}
