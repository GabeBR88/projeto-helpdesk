import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT")
    return res.status(405).json({ erro: "Método não permitido" });

  const {
    id_user,
    nome_user,
    sobrenome_user,
    genero,
    email_user,
    telefone,
    perfil,
    username,
    ativo,
  } = req.body;

  if (!id_user) return res.status(400).json({ erro: "ID obrigatório" });

  try {
    await pool.query(
      `UPDATE tbl_funcionarios 
       SET nome_user = ?, sobrenome_user = ?, genero = ?, email_user = ?, telefone = ?, perfil = ?, username = ?, ativo = ?
       WHERE id_user = ?`,
      [
        nome_user,
        sobrenome_user,
        genero,
        email_user,
        telefone,
        perfil,
        username,
        ativo,
        id_user,
      ],
    );
    res.status(200).json({ mensagem: "Usuário atualizado!" });
  } catch {
    res.status(500).json({ erro: "Erro ao atualizar usuário" });
  }
}
