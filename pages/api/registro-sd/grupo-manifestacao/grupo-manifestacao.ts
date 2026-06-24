import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET")
    return res.status(405).json({ erro: "Método não permitido" });

  const { manifestacao } = req.query;

  try {
    let query: string;
    const params: (string | number)[] = [];

    if (manifestacao && manifestacao !== "") {
      query = `SELECT g.id_grupo, g.codigo, g.descricao 
               FROM tbl_grupo_manifestacao g
               INNER JOIN tbl_manifestacao m ON g.id_manifestacao = m.id_manifestacao
               WHERE m.codigo = ? 
                 AND g.ativo = 1 
                 AND g.codigo != 'chamado_redirecionado'
               ORDER BY g.descricao`;
      params.push(String(manifestacao));
    } else {
      query = `SELECT id_grupo, codigo, descricao 
               FROM tbl_grupo_manifestacao 
               WHERE ativo = 1 
                 AND codigo != 'chamado_redirecionado'
               ORDER BY descricao`;
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar grupo de manifestacao: ", error);
    res.status(500).json({ erro: "Erro ao buscar grupo de manifestacao" });
  }
}
