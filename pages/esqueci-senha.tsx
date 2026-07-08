import { useState } from "react";
import { BotaoPrincipal } from "./components/button";
import FooterEstilizacao from "./components/footer";
import TituloSite from "./components/title";
import { useRouter } from "next/router";

export default function EsqueciSenha() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!username.trim()) {
      setErro("Digite seu nome de usuário");
      return;
    }

    const resposta = await fetch("/api/auth/solicitar-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      setErro(dados.erro);
      return;
    }

    setSucesso(true);
  };

  if (sucesso) {
    return (
      <>
        <TituloSite titulo="Solicitação Enviada" />
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
                  <div className="bg-green-600 px-8 py-6 text-center">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="bi bi-check-circle text-3xl text-white"></i>
                    </div>
                    <h1 className="text-white font-bold text-xl">
                      SOLICITAÇÃO ENVIADA!
                    </h1>
                    <p className="text-white/70 text-sm mt-1">
                      Um administrador irá resetar sua senha
                    </p>
                  </div>
                  <div className="p-8 text-center">
                    <p className="text-xs text-(--color-monochromatic-2) mb-5">
                      Você receberá um e-mail com a nova senha quando for
                      resetada.
                    </p>
                    <button
                      onClick={() => router.push("/")}
                      className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-(--color-monochromatic-2) transition-colors"
                    >
                      <i className="bi bi-arrow-left mr-1"></i>Voltar ao login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TituloSite titulo="Esqueci minha senha" />
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
                  <div className="bg-(--color-monochromatic-2) w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="bi bi-question-circle text-3xl text-(--color-monochromatic-5)"></i>
                  </div>
                  <h1 className="text-(--color-monochromatic-5) font-bold text-xl">
                    ESQUECI MINHA SENHA
                  </h1>
                  <p className="text-(--color-monochromatic-4) text-sm mt-1">
                    Digite seu usuário para solicitar o reset
                  </p>
                </div>
                <div className="p-8">
                  <form
                    className="flex flex-col gap-5"
                    onSubmit={handleSolicitar}
                  >
                    {erro && (
                      <p className="bg-red-100 text-red-800 text-xs font-bold px-4 py-2 rounded-lg text-center">
                        <i className="bi bi-exclamation-triangle mr-1"></i>
                        {erro}
                      </p>
                    )}
                    <div>
                      <label className="text-(--color-monochromatic-1) text-xs font-bold uppercase tracking-wider mb-2 block">
                        <i className="bi bi-person-fill mr-1"></i> Usuário
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) font-medium uppercase"
                        placeholder="Seu nome de usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <BotaoPrincipal icon="bi-send" texto="Solicitar Reset" />
                    <button
                      type="button"
                      onClick={() => router.push("/")}
                      className="text-xs text-(--color-monochromatic-3) hover:text-(--color-monochromatic-1) transition-colors text-center"
                    >
                      <i className="bi bi-arrow-left mr-1"></i>Voltar ao login
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
