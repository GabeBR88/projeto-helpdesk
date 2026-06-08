import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { DetalhesChamado } from "@/types/interfaces";

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
    const [rows] = await pool.query<DetalhesChamado[]>(
      `SELECT 
        o.id_ocorrencia,
        o.num_chamado,
        c.descricao AS categoria,
        f.nome_user,
        f.sobrenome_user,
        f.email_user,
        f.telefone,
        f.username,
        s.descricao AS setor,
        o.descricao,
        o.anexo,
        o.status_ocorrencia,
        o.prioridade,
        o.data_hora_ocorrencia,
        o.data_hora_conclusao,
        t.username AS username_tecnico,
        t.nome_user AS nome_tecnico,
        t.sobrenome_user AS sobrenome_tecnico
      FROM tbl_ocorrencia o
      JOIN tbl_categorias_ocorrencia c ON o.id_categoria = c.id_categoria
      JOIN tbl_setores_empresa s ON o.id_setor = s.id_setor
      JOIN tbl_funcionarios f ON o.id_user = f.id_user
      LEFT JOIN tbl_funcionarios t ON o.id_tecnico = t.id_user
      WHERE o.num_chamado = ?`,
      [`#${chamado}`],
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Chamado não encontrado" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar detalhes do chamado:", error);
    res.status(500).json({ erro: "Erro ao buscar detalhes do chamado" });
  }
}
