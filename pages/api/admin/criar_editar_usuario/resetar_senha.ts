import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { registrarLog } from "@/lib/logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_user, nova_senha } = req.body;

  if (!id_user || !nova_senha) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  try {
    const senhaHash = await bcrypt.hash(nova_senha, 10);
    await pool.query(
      "UPDATE tbl_funcionarios SET senha_hash = ? WHERE id_user = ?",
      [senhaHash, id_user],
    );

    const usuarioCookie = req.cookies.usuario;
    if (usuarioCookie) {
      const { id } = JSON.parse(usuarioCookie);
      await registrarLog(
        id,
        "resetar_senha",
        `Resetou a senha do usuário ID ${id_user}`,
      );
    }
    res.status(200).json({ mensagem: "Senha resetada com sucesso!" });
  } catch {
    res.status(500).json({ erro: "Erro ao resetar senha" });
  }
}
