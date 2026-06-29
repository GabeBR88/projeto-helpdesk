import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ erro: "Método não permitido" });

  const {
    nome_user,
    sobrenome_user,
    genero,
    email_user,
    telefone,
    perfil,
    username,
    senha,
    ativo,
  } = req.body;

  if (
    !nome_user ||
    !sobrenome_user ||
    !email_user ||
    !perfil ||
    !username ||
    !senha
  ) {
    return res
      .status(400)
      .json({ erro: "Preencha todos os campos obrigatórios" });
  }

  try {
    // Verifica se username já existe
    const [existente] = await pool.query<RowDataPacket[]>(
      "SELECT id_user FROM tbl_funcionarios WHERE username = ?",
      [username],
    );

    if (existente && existente.length > 0) {
      return res.status(400).json({ erro: "Nome de usuário já existe" });
    }

    await pool.query(
      `INSERT INTO tbl_funcionarios 
       (nome_user, sobrenome_user, genero, email_user, telefone, perfil, username, senha_hash, ativo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome_user,
        sobrenome_user,
        genero || "Prefiro não informar",
        email_user,
        telefone || null,
        perfil,
        username,
        senha,
        ativo || 1,
      ],
    );
    res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
  } catch {
    res.status(500).json({ erro: "Erro ao criar usuário" });
  }
}
