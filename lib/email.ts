import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarEmailReset(
  destinatario: string,
  nome: string,
  usuario: string,
  novaSenha: string,
) {
  const mailOptions = {
    from: `"HelpDesk" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: "🔑 Senha Resetada - HelpDesk",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333;">Olá, ${nome}!</h2>
        <p>Sua senha foi resetada por um administrador.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Usuário:</strong> ${usuario}</p>
          <p><strong>Nova senha:</strong> ${novaSenha}</p>
        </div>
        <p>Acesse o sistema em: <a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}">HelpDesk</a></p>
        <p style="color: #999; font-size: 12px;">Por segurança, altere sua senha no primeiro acesso.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return { sucesso: false, erro: error };
  }
}
