import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { ChamadoSD } from "@/types/interfaces";

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

  try {
    const [rows] = await pool.query<ChamadoSD[]>(
      `SELECT 
    o.num_chamado,
    c.descricao AS categoria,
    s.descricao AS setor,
    f.nome_user,
    f.sobrenome_user,
    o.descricao,  -- ← ADICIONE
    o.status_ocorrencia,
    o.data_hora_ocorrencia
  FROM tbl_ocorrencia o
  JOIN tbl_categorias_ocorrencia c ON o.id_categoria = c.id_categoria
  JOIN tbl_setores_empresa s ON o.id_setor = s.id_setor
  JOIN tbl_funcionarios f ON o.id_user = f.id_user
  WHERE o.status_ocorrencia = 'Pendente'
  ORDER BY o.data_hora_ocorrencia ASC`,
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar chamados:", error);
    res.status(500).json({ erro: "Erro ao buscar chamados" });
  }
}
