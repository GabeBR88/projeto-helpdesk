import { useState } from "react";
import { BotaoPrincipal } from "./components/button";
import FooterEstilizacao from "./components/footer";
import TituloSite from "./components/title";
import VersaoCabecalho from "./components/versionamento-header";
import { useRouter } from "next/router";

export default function PaginaLogin() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");

    const resposta = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      setErro(dados.erro);
      return;
    }

    console.log("🔍 Dados do login:", dados);

    if (dados.usuario.primeiro_acesso) {
      // Salva cookie com a flag primeiro_acesso
      document.cookie = `usuario=${JSON.stringify({
        id: dados.usuario.id,
        usuario: dados.usuario.usuario,
        perfil: dados.usuario.perfil,
        primeiro_acesso: true,
      })}; path=/`;
      router.push(`/criar-senha?id=${dados.usuario.id}`);
      return;
    }

    // Salva o cookie
    document.cookie = `usuario=${JSON.stringify(dados.usuario)}; path=/`;

    // Redireciona conforme o perfil
    if (dados.usuario.perfil === "administrador") {
      router.push("/administrador");
    } else if (dados.usuario.perfil === "servicedesk") {
      router.push("/servicedesk");
    } else {
      router.push("/usuario");
    }
  };

  return (
    <>
      <TituloSite titulo="Serviços online de soluções" />

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
            <VersaoCabecalho />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="interface w-full">
            <div className="max-w-md mx-auto">
              <div className="bg-(--color-monochromatic-5) rounded-none shadow-2xl overflow-hidden">
                <div className="bg-(--color-monochromatic-1) px-8 py-6 text-center">
                  <div className="bg-(--color-monochromatic-2) w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-(--color-monochromatic-4)">
                    <i className="bi bi-shield-lock-fill text-3xl text-(--color-monochromatic-5)"></i>
                  </div>
                  <h1 className="text-(--color-monochromatic-5) font-bold text-xl tracking-wide">
                    ACESSO AO SISTEMA
                  </h1>
                  <p className="text-(--color-monochromatic-4) text-sm mt-1">
                    Autenticação obrigatória para continuar
                  </p>
                </div>

                <div className="p-8">
                  <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                    {erro && (
                      <p className="bg-red-100 text-red-800 text-xs font-bold px-4 py-2 rounded-lg text-center">
                        {erro}
                      </p>
                    )}
                    {/* Campo Usuário */}
                    <div>
                      <label
                        htmlFor="inUsuario"
                        className="text-(--color-monochromatic-1) text-xs font-bold uppercase tracking-wider mb-2 block"
                      >
                        <i className="bi bi-person-fill mr-1"></i> Usuário
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) font-medium"
                        placeholder="ex.: JSilva*67"
                        id="inUsuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    {/* Campo Senha */}
                    <div>
                      <label
                        htmlFor="inSenha"
                        className="text-(--color-monochromatic-1) text-xs font-bold uppercase tracking-wider mb-2 block"
                      >
                        <i className="bi bi-key-fill mr-1"></i> Senha
                      </label>
                      <div className="relative">
                        <input
                          type={mostrarSenha ? "text" : "password"}
                          className="w-full px-4 py-3 pr-12 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) font-medium"
                          placeholder="••••••••••"
                          id="inSenha"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors"
                          aria-label={
                            mostrarSenha ? "Esconder senha" : "Mostrar senha"
                          }
                        >
                          <i
                            className={`bi ${mostrarSenha ? "bi-eye-slash-fill" : "bi-eye-fill"} text-lg`}
                          ></i>
                        </button>
                      </div>
                    </div>

                    {/* Botão Entrar */}
                    <BotaoPrincipal
                      icon="bi-box-arrow-in-right"
                      texto="Autenticar"
                    />
                  </form>

                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-(--color-monochromatic-4)">
                    <p className="text-(--color-monochromatic-3) text-xs hover:text-(--color-monochromatic-1) cursor-pointer transition-colors">
                      <i className="bi bi-question-circle mr-1"></i> Esqueci
                      minha senha
                    </p>
                    <p className="text-(--color-monochromatic-3) text-xs hover:text-(--color-monochromatic-1) cursor-pointer transition-colors">
                      <i className="bi bi-headset mr-1"></i> Suporte Técnico
                    </p>
                  </div>
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
