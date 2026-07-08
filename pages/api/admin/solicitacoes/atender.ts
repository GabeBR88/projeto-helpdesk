import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { enviarEmailReset } from "@/lib/email";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_solicitacao } = req.body;

  try {
    const [solic] = await pool.query<RowDataPacket[]>(
      `SELECT s.id_user, f.nome_user, f.email_user, f.username
       FROM tbl_solicitacoes_reset s
       INNER JOIN tbl_funcionarios f ON s.id_user = f.id_user
       WHERE s.id_solicitacao = ? AND s.status = 'pendente'`,
      [id_solicitacao],
    );

    if (!solic || solic.length === 0) {
      return res.status(404).json({ erro: "Solicitação não encontrada" });
    }

    const usuario = solic[0];
    const novaSenha = `${usuario.nome_user}123`;
    const usuarioCookie = req.cookies.usuario;
    if (!usuarioCookie) {
      return res.status(401).json({ erro: "Não autorizado" });
    }
    const { id } = JSON.parse(usuarioCookie);

    // Atualiza senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await pool.query(
      "UPDATE tbl_funcionarios SET senha_hash = ? WHERE id_user = ?",
      [senhaHash, usuario.id_user],
    );

    // Atualiza solicitação
    await pool.query(
      "UPDATE tbl_solicitacoes_reset SET status = 'atendido', data_atendimento = NOW(), id_admin = ? WHERE id_solicitacao = ?",
      [id, id_solicitacao],
    );

    // Envia e-mail real
    const resultado = await enviarEmailReset(
      usuario.email_user,
      usuario.nome_user,
      usuario.username,
      novaSenha,
    );

    if (!resultado.sucesso) {
      console.error("Erro ao enviar e-mail:", resultado.erro);
      return res.status(200).json({
        mensagem: "Senha resetada, mas houve erro ao enviar e-mail.",
        novaSenha,
      });
    }

    res
      .status(200)
      .json({ mensagem: "Senha resetada e e-mail enviado!", novaSenha });
  } catch {
    res.status(500).json({ erro: "Erro ao atender solicitação" });
  }
}
