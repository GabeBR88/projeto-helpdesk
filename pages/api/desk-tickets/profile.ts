import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { PerfilUsuario } from "@/types/interfaces";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Barra qualquer método que não seja GET
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const usuarioCookie = req.cookies.usuario;
  if (!usuarioCookie) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  const { id } = JSON.parse(usuarioCookie);

  const [rows] = await pool.query<PerfilUsuario[]>(
    "SELECT nome_user, sobrenome_user, email_user, telefone, perfil FROM tbl_funcionarios WHERE id_user = ?",
    [id],
  );

  if (rows.length === 0) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  res.status(200).json(rows[0]);
}
