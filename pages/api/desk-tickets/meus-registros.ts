import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { MeusRegistros } from "@/types/interfaces";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { chamado } = req.query;

  if (!chamado) {
    return res.status(400).json({ erro: "Número do chamado não informado" });
  }

  try {
    const [rows] = await pool.query<MeusRegistros[]>(
      `SELECT 
  a.id_atendimento,
  o.num_chamado,
  t.username AS login_tecnico,
  m.codigo AS manifestacao_codigo,       -- ← Adicione
  m.descricao AS manifestacao,
  g.codigo AS grupo_manifestacao_codigo, -- ← Adicione
  g.descricao AS grupo_manifestacao,
  COALESCE(tm.codigo, '') AS tipo_manifestacao_codigo, -- ← Adicione
  COALESCE(tm.descricao, '—') AS tipo_manifestacao,
  a.comentario,
  a.status,
  a.data_hora_atendimento
  FROM tbl_atendimentos a
  JOIN tbl_ocorrencia o ON a.id_ocorrencia = o.id_ocorrencia
  JOIN tbl_funcionarios t ON a.id_tecnico = t.id_user
  JOIN tbl_manifestacao m ON a.id_manifestacao = m.id_manifestacao
  JOIN tbl_grupo_manifestacao g ON a.id_grupo = g.id_grupo
  LEFT JOIN tbl_tipo_manifestacao tm ON a.id_tipo = tm.id_tipo
  WHERE o.num_chamado = ?
  ORDER BY a.data_hora_atendimento ASC`,
      [`#${chamado}`],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ erro: "Erro ao buscar histórico" });
  }
}
