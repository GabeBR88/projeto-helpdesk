import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";
import { registrarLog } from "@/lib/logs";

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
    const [userExistente] = await pool.query<RowDataPacket[]>(
      "SELECT id_user FROM tbl_funcionarios WHERE username = ?",
      [username],
    );
    if (userExistente && userExistente.length > 0) {
      return res.status(400).json({ erro: "Nome de usuário já existe" });
    }

    // Verifica se e-mail já existe
    const [emailExistente] = await pool.query<RowDataPacket[]>(
      "SELECT id_user FROM tbl_funcionarios WHERE email_user = ?",
      [email_user],
    );
    if (emailExistente && emailExistente.length > 0) {
      return res.status(400).json({ erro: "E-mail já cadastrado" });
    }

    // Verifica se telefone já existe (se informado)
    if (telefone) {
      const [telExistente] = await pool.query<RowDataPacket[]>(
        "SELECT id_user FROM tbl_funcionarios WHERE telefone = ?",
        [telefone],
      );
      if (telExistente && telExistente.length > 0) {
        return res.status(400).json({ erro: "Telefone já cadastrado" });
      }
    }

    const senhaHash = await bcrypt.hash(senha, 10);

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
        senhaHash,
        ativo || 1,
      ],
    );

    const usuarioCookie = req.cookies.usuario;
    if (usuarioCookie) {
      const { id } = JSON.parse(usuarioCookie);
      await registrarLog(
        id,
        "criar_usuario",
        `Criou o usuário ${username} (${nome_user} ${sobrenome_user}) - Perfil: ${perfil}`,
      );
    }

    res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
  } catch {
    res.status(500).json({ erro: "Erro ao criar usuário" });
  }
}
