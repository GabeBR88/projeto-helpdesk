import { useState, useEffect } from "react";
import { BotaoPrincipal } from "./components/button";
import FooterEstilizacao from "./components/footer";
import TituloSite from "./components/title";
import { useRouter } from "next/router";

export default function CriarSenha() {
  const router = useRouter();
  const { id } = router.query;

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("usuario="))
      ?.split("=")[1];

    if (!cookie) {
      router.push("/");
      return;
    }

    const usuario = JSON.parse(decodeURIComponent(cookie));

    // Só permite acesso se for primeiro_acesso
    if (!usuario.primeiro_acesso) {
      router.push("/");
      return;
    }
  }, [router]);

  const validarSenha = (senha: string): string | null => {
    if (senha.length < 8) return "A senha deve ter no mínimo 8 caracteres";
    if (senha.length > 20) return "A senha deve ter no máximo 20 caracteres";
    if (!/[A-Z]/.test(senha))
      return "A senha deve conter pelo menos 1 letra maiúscula";
    if (!/[a-z]/.test(senha))
      return "A senha deve conter pelo menos 1 letra minúscula";
    if (!/[0-9]/.test(senha)) return "A senha deve conter pelo menos 1 número";
    return null;
  };

  const handleCriarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    const validacao = validarSenha(novaSenha);
    if (validacao) {
      setErro(validacao);
      return;
    }

    const resposta = await fetch("/api/auth/alterar-senha", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_user: Number(id), nova_senha: novaSenha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      setErro(dados.erro);
      return;
    }

    setSucesso("Senha criada com sucesso! Redirecionando...");
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  const forcaSenha = (): { texto: string; cor: string } => {
    if (novaSenha.length === 0) return { texto: "", cor: "" };
    if (novaSenha.length < 8) return { texto: "Fraca", cor: "text-red-500" };
    if (
      /[A-Z]/.test(novaSenha) &&
      /[a-z]/.test(novaSenha) &&
      /[0-9]/.test(novaSenha)
    ) {
      if (novaSenha.length >= 12)
        return { texto: "Forte", cor: "text-green-500" };
      return { texto: "Média", cor: "text-yellow-500" };
    }
    return { texto: "Fraca", cor: "text-red-500" };
  };

  const forca = forcaSenha();

  return (
    <>
      <TituloSite titulo="Criar Nova Senha" />

      <div className="min-h-screen flex flex-col">
        <div className="bg-(--color-monochromatic-1) border-b border-(--color-monochromatic-3)">
          <div className="interface py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-(--color-monochromatic-4) rounded flex items-center justify-center">
                <i className="bi bi-headset text-(--color-monochromatic-1) text-lg"></i>
              </div>
              <span className="text-(--color-monochromatic-5) font-semibold tracking-wide">
                HELPDESK
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="interface w-full">
            <div className="max-w-md mx-auto">
              <div className="bg-(--color-monochromatic-5) rounded-none shadow-2xl overflow-hidden">
                <div className="bg-(--color-monochromatic-1) px-8 py-6 text-center">
                  <div className="bg-(--color-monochromatic-2) w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-(--color-monochromatic-4)">
                    <i className="bi bi-key-fill text-3xl text-(--color-monochromatic-5)"></i>
                  </div>
                  <h1 className="text-(--color-monochromatic-5) font-bold text-xl tracking-wide">
                    CRIAR NOVA SENHA
                  </h1>
                  <p className="text-(--color-monochromatic-4) text-sm mt-1">
                    Primeiro acesso - defina sua senha pessoal
                  </p>
                </div>

                <div className="p-8">
                  <form
                    className="flex flex-col gap-5"
                    onSubmit={handleCriarSenha}
                  >
                    {erro && (
                      <p className="bg-red-100 text-red-800 text-xs font-bold px-4 py-2 rounded-lg text-center">
                        <i className="bi bi-exclamation-triangle mr-1"></i>
                        {erro}
                      </p>
                    )}
                    {sucesso && (
                      <p className="bg-green-100 text-green-800 text-xs font-bold px-4 py-2 rounded-lg text-center">
                        <i className="bi bi-check-circle mr-1"></i>
                        {sucesso}
                      </p>
                    )}

                    {/* Nova Senha */}
                    <div>
                      <label className="text-(--color-monochromatic-1) text-xs font-bold uppercase tracking-wider mb-2 block">
                        <i className="bi bi-lock-fill mr-1"></i> Nova Senha
                      </label>
                      <div className="relative">
                        <input
                          type={mostrarSenha ? "text" : "password"}
                          className="w-full px-4 py-3 pr-12 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) font-medium"
                          placeholder="••••••••••"
                          value={novaSenha}
                          onChange={(e) => setNovaSenha(e.target.value)}
                          onCopy={(e) => e.preventDefault()}
                          onPaste={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          onContextMenu={(e) => e.preventDefault()}
                          required
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors"
                        >
                          <i
                            className={`bi ${mostrarSenha ? "bi-eye-slash-fill" : "bi-eye-fill"} text-lg`}
                          ></i>
                        </button>
                      </div>
                      {forca.texto && (
                        <p className={`text-xs mt-1 font-bold ${forca.cor}`}>
                          Força da senha: {forca.texto}
                        </p>
                      )}
                    </div>

                    {/* Confirmar Senha */}
                    <div>
                      <label className="text-(--color-monochromatic-1) text-xs font-bold uppercase tracking-wider mb-2 block">
                        <i className="bi bi-lock-fill mr-1"></i> Confirmar Senha
                      </label>
                      <input
                        type={mostrarSenha ? "text" : "password"}
                        className="w-full px-4 py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) font-medium"
                        placeholder="••••••••••"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        onCopy={(e) => e.preventDefault()}
                        onPaste={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                        required
                      />
                    </div>

                    {/* Requisitos */}
                    <div className="bg-(--color-monochromatic-4)/10 rounded-lg p-3">
                      <p className="text-[10px] font-bold uppercase text-(--color-monochromatic-2) mb-2">
                        Requisitos da senha:
                      </p>
                      <ul className="text-[10px] text-(--color-monochromatic-3) space-y-1">
                        <li
                          className={
                            novaSenha.length >= 8 ? "text-green-600" : ""
                          }
                        >
                          <i
                            className={`bi ${novaSenha.length >= 8 ? "bi-check-circle-fill" : "bi-circle"} mr-1`}
                          ></i>
                          Mínimo 8 caracteres
                        </li>
                        <li
                          className={
                            novaSenha.length <= 20
                              ? "text-green-600"
                              : novaSenha.length > 20
                                ? "text-red-500"
                                : ""
                          }
                        >
                          <i
                            className={`bi ${novaSenha.length <= 20 && novaSenha.length > 0 ? "bi-check-circle-fill" : "bi-circle"} mr-1`}
                          ></i>
                          Máximo 20 caracteres
                        </li>
                        <li
                          className={
                            /[A-Z]/.test(novaSenha) ? "text-green-600" : ""
                          }
                        >
                          <i
                            className={`bi ${/[A-Z]/.test(novaSenha) ? "bi-check-circle-fill" : "bi-circle"} mr-1`}
                          ></i>
                          Pelo menos 1 letra maiúscula
                        </li>
                        <li
                          className={
                            /[a-z]/.test(novaSenha) ? "text-green-600" : ""
                          }
                        >
                          <i
                            className={`bi ${/[a-z]/.test(novaSenha) ? "bi-check-circle-fill" : "bi-circle"} mr-1`}
                          ></i>
                          Pelo menos 1 letra minúscula
                        </li>
                        <li
                          className={
                            /[0-9]/.test(novaSenha) ? "text-green-600" : ""
                          }
                        >
                          <i
                            className={`bi ${/[0-9]/.test(novaSenha) ? "bi-check-circle-fill" : "bi-circle"} mr-1`}
                          ></i>
                          Pelo menos 1 número
                        </li>
                      </ul>
                    </div>

                    <BotaoPrincipal
                      icon="bi-check-circle"
                      texto="Criar Senha"
                    />
                  </form>
                </div>
              </div>
              <FooterEstilizacao />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
