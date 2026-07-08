import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../lib/db";
import { ValidarUsuario } from "@/types/interfaces";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  try {
    const [rows] = (await pool.query(
      "SELECT * FROM tbl_funcionarios WHERE username = ?",
      [usuario],
    )) as [ValidarUsuario[], unknown];

    if (rows.length === 0) {
      return res.status(401).json({ erro: "Usuário ou Senha inválidos" });
    }

    const funcionario = rows[0];

    // Verifica se o usuário está ativo
    if (funcionario.ativo !== 1) {
      const motivos: Record<number, string> = {
        0: "Usuário desligado. Acesso não permitido.",
        2: "Usuário em férias. Acesso não permitido.",
      };
      return res
        .status(401)
        .json({ erro: motivos[funcionario.ativo] || "Acesso não permitido" });
    }

    const senhaValida = await bcrypt.compare(senha, funcionario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: "Usuário ou Senha inválidos" });
    }

    await pool.query(
      "UPDATE tbl_funcionarios SET ultimo_acesso = NOW() WHERE id_user = ?",
      [funcionario.id_user],
    );

    // Verifica se a senha segue o padrão de reset (nome + 123)
    const nomeLimpo = funcionario.nome_user.trim();
    const senhaPadrao = `${nomeLimpo}123`;

    res.status(200).json({
      mensagem: "Login realizado com sucesso",
      usuario: {
        id: funcionario.id_user,
        usuario: funcionario.username,
        perfil: funcionario.perfil,
        primeiro_acesso: senha === senhaPadrao,
      },
    });
  } catch {
    res.status(500).json({ erro: "Erro no servidor" });
  }
}
