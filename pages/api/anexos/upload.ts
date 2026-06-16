import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Configuração do multer
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "chamados",
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const nomeUnico = `${uuidv4()}${ext}`;
      cb(null, nomeUnico);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Tipo de arquivo não permitido. Use: JPG, PNG, GIF, WebP ou PDF",
        ),
      );
    }
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

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

  try {
    await new Promise<void>((resolve, reject) => {
      // @ts-expect-error: multer array upload uses Express types, compatible in runtime with Next.js
      upload.array("anexos", 5)(req, res, (err: unknown) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    // @ts-expect-error: files is added by multer at runtime
    const files = req.files as Express.Multer.File[] | undefined;
    const { id_ocorrencia } = req.body as { id_ocorrencia?: string };

    if (!files || files.length === 0) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }

    if (!id_ocorrencia) {
      return res.status(400).json({ erro: "ID da ocorrência é obrigatório" });
    }

    const anexosSalvos: {
      nome_original: string;
      nome_salvo: string;
      caminho: string;
      tamanho: number;
    }[] = [];

    for (const file of files) {
      const caminhoRelativo = `/uploads/chamados/${file.filename}`;

      await pool.query(
        `INSERT INTO tbl_anexos 
         (id_ocorrencia, nome_original, nome_salvo, caminho, tipo_mime, tamanho_bytes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          Number(id_ocorrencia),
          file.originalname,
          file.filename,
          caminhoRelativo,
          file.mimetype,
          file.size,
        ],
      );

      anexosSalvos.push({
        nome_original: file.originalname,
        nome_salvo: file.filename,
        caminho: caminhoRelativo,
        tamanho: file.size,
      });
    }

    res.status(201).json({
      mensagem: `${files.length} arquivo(s) enviado(s) com sucesso!`,
      anexos: anexosSalvos,
    });
  } catch (error: unknown) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao fazer upload";
    console.error("Erro ao fazer upload:", error);
    res.status(500).json({ erro: mensagem });
  }
}
