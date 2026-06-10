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
      // Na query SELECT, adicione a.id_atendimento
      `SELECT 
  a.id_atendimento,  -- ← ADICIONAR ESTA LINHA
  o.num_chamado,
  f.username AS login_tecnico,
  m.descricao AS manifestacao,
  m.codigo AS manifestacao_codigo,
  gm.descricao AS grupo_manifestacao,
  gm.codigo AS grupo_manifestacao_codigo,
  tm.descricao AS tipo_manifestacao,
  tm.codigo AS tipo_manifestacao_codigo,
  a.comentario,
  a.status,
  a.data_hora_atendimento
FROM tbl_atendimentos a
INNER JOIN tbl_ocorrencia o ON a.id_ocorrencia = o.id_ocorrencia
INNER JOIN tbl_funcionarios f ON a.id_tecnico = f.id_user
INNER JOIN tbl_manifestacao m ON a.id_manifestacao = m.id_manifestacao
INNER JOIN tbl_grupo_manifestacao gm ON a.id_grupo = gm.id_grupo
INNER JOIN tbl_tipo_manifestacao tm ON a.id_tipo = tm.id_tipo
WHERE o.num_chamado = ?
ORDER BY a.data_hora_atendimento DESC`,
      [`#${chamado}`],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ erro: "Erro ao buscar histórico" });
  }
}
