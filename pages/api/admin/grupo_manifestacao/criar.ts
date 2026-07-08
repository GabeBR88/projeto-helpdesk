import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { registrarLog } from "@/lib/logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ erro: "Método não permitido" });

  const { id_manifestacao, codigo, descricao, ativo } = req.body;
  if (!id_manifestacao || !codigo || !descricao)
    return res.status(400).json({ erro: "Preencha todos os campos" });

  try {
    await pool.query(
      "INSERT INTO tbl_grupo_manifestacao (id_manifestacao, codigo, descricao, ativo) VALUES (?, ?, ?, ?)",
      [id_manifestacao, codigo, descricao, ativo],
    );

    const usuarioCookie = req.cookies.usuario;
    if (usuarioCookie) {
      const { id } = JSON.parse(usuarioCookie);
      await registrarLog(id, "criar_grupo", `Criou o grupo "${descricao}"`);
    }

    res.status(201).json({ mensagem: "Grupo criado com sucesso!" });
  } catch (error) {
    console.error("Erro ao criar grupo:", error); // ← ADICIONE ISSO
    res.status(500).json({ erro: "Erro ao criar grupo" });
  }
}
