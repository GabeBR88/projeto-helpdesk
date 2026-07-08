import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ erro: "Método não permitido" });

  const { username } = req.body;

  if (!username) return res.status(400).json({ erro: "Digite o usuário" });

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id_user FROM tbl_funcionarios WHERE username = ? AND ativo = 1",
      [username],
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const id_user = rows[0].id_user;

    // Verifica se já tem solicitação pendente
    const [pendente] = await pool.query<RowDataPacket[]>(
      "SELECT id_solicitacao FROM tbl_solicitacoes_reset WHERE id_user = ? AND status = 'pendente'",
      [id_user],
    );

    if (pendente && pendente.length > 0) {
      return res
        .status(400)
        .json({ erro: "Já existe uma solicitação pendente para este usuário" });
    }

    await pool.query(
      "INSERT INTO tbl_solicitacoes_reset (id_user) VALUES (?)",
      [id_user],
    );

    res.status(201).json({ mensagem: "Solicitação enviada com sucesso!" });
  } catch {
    res.status(500).json({ erro: "Erro ao processar solicitação" });
  }
}
