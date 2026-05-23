import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../lib/db";
import { ValidarUsuario } from "@/types/interfaces";

// Função responsável para gerenciar a comunicação entre o front-end  e o back-end que "fala" com o banco de dados
export default async function handler(
  req: NextApiRequest, // O que chega do frontend
  res: NextApiResponse, // O que vai responder
) {
  // Barra qualquer método que não seja POST
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  try {
    // Consulta o banco de dados para confirmar se o usuário existe
    const [rows] = (await pool.query(
      "SELECT * FROM tbl_funcionarios WHERE username = ?",
      [usuario],
    )) as [ValidarUsuario[], unknown];

    if (rows.length === 0) {
      return res.status(401).json({ erro: "Usuário ou Senha inválidos" });
    }

    const funcionario = rows[0];

    if (senha !== funcionario.senha_hash) {
      return res.status(401).json({ erro: "Usuário ou Senha inválidos" });
    }

    await pool.query(
      "UPDATE tbl_funcionarios SET ultimo_acesso = NOW() WHERE id_user = ?",
      [funcionario.id_user],
    );

    // Na resposta JSON do login:
    res.status(200).json({
      mensagem: "Login realizado com sucesso",
      usuario: {
        id: funcionario.id_user,
        usuario: funcionario.username,
        perfil: funcionario.perfil,
      },
    });
  } catch {
    res.status(500).json({ erro: "Erro no servidor" });
  }
}
