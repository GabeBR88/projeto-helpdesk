import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { registrarLog } from "@/lib/logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ erro: "Método não permitido" });

  const { codigo, descricao, ativo } = req.body;

  if (!codigo || !descricao)
    return res.status(400).json({ erro: "Preencha todos os campos" });

  try {
    await pool.query(
      "INSERT INTO tbl_setores_empresa (codigo, descricao, ativo) VALUES (?, ?, ?)",
      [codigo, descricao, ativo],
    );

    const usuarioCookie = req.cookies.usuario;
    if (usuarioCookie) {
      const { id } = JSON.parse(usuarioCookie);
      await registrarLog(id, "criar_setor", `Criou o setor "${descricao}"`);
    }

    res.status(201).json({ mensagem: "Setor criado com sucesso!" });
  } catch {
    res.status(500).json({ erro: "Erro ao criar setor" });
  }
}
