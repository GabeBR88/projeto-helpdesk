import pool from "@/lib/db";

export async function registrarLog(
  id_admin: number,
  acao: string,
  descricao: string,
) {
  try {
    await pool.query(
      "INSERT INTO tbl_logs (id_admin, acao, descricao) VALUES (?, ?, ?)",
      [id_admin, acao, descricao],
    );
  } catch (error) {
    console.error("Erro ao registrar log:", error);
  }
}
