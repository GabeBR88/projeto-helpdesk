import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const usuarioCookie = req.cookies.usuario;
  if (!usuarioCookie) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  const { id } = JSON.parse(usuarioCookie);
  const { setor, categoria, descricao } = req.body;

  if (!setor || !categoria) {
    return res.status(400).json({ erro: "Setor e categoria são obrigatórios" });
  }

  try {
    // Busca o id_categoria pelo código
    const [cat] = await pool.query<RowDataPacket[]>(
      "SELECT id_categoria FROM tbl_categorias_ocorrencia WHERE codigo = ?",
      [categoria],
    );

    if (!cat[0]) {
      return res.status(400).json({ erro: "Categoria inválida" });
    }

    const id_categoria = cat[0].id_categoria;

    // Busca o id_setor pelo código
    const [set] = await pool.query<RowDataPacket[]>(
      "SELECT id_setor FROM tbl_setores_empresa WHERE codigo = ?",
      [setor],
    );

    if (!set[0]) {
      return res.status(400).json({ erro: "Setor inválido" });
    }

    const id_setor = set[0].id_setor;

    // Gera o número do chamado
    const [ultimo] = await pool.query<RowDataPacket[]>(
      "SELECT MAX(CAST(SUBSTRING(num_chamado, 2) AS UNSIGNED)) as ultimo FROM tbl_ocorrencia",
    );
    const proximo = (ultimo[0]?.ultimo || 0) + 1;
    const num_chamado = `#${String(proximo).padStart(5, "0")}`;

    // Calcula prazo de 24h
    const prazo = new Date();
    prazo.setHours(prazo.getHours() + 24);

    // Salva no banco e pega o ID gerado
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tbl_ocorrencia 
       (num_chamado, id_user, id_setor, id_categoria, descricao, data_hora_ocorrencia, prazo_final, status_ocorrencia) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?, 'Pendente')`,
      [num_chamado, id, id_setor, id_categoria, descricao || null, prazo],
    );

    const id_ocorrencia = result.insertId;

    res.status(201).json({
      mensagem: "Chamado criado com sucesso!",
      num_chamado: num_chamado,
      id_ocorrencia: id_ocorrencia,
    });
  } catch (error) {
    console.error("Erro ao criar chamado:", error);
    res.status(500).json({ erro: "Erro ao criar chamado" });
  }
}
