import { BotaoEstilizado, BotaoPrincipal } from "../components/button";
import { atualizarNomeArquivo, botaoLimpar, removerArquivo } from "./script";
import FooterEstilizacao from "../components/footer";
import TituloSite from "../components/title";
import TopBar from "../components/topbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { CategoriasUser, MeuChamado, Setor } from "@/types/interfaces";

export default function PerfilUsuario() {
  const [setor, setSetor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [meusChamados, setMeusChamados] = useState<MeuChamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [dadosUsuario, setDadosUsuario] = useState({
    nome_user: "",
    sobrenome_user: "",
    email_user: "",
    telefone: "",
    perfil: "",
  });
  const [categorias, setCategorias] = useState<CategoriasUser[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);

  useEffect(() => {
    fetch("/api/setores/setores")
      .then((res) => res.json())
      .then((data) => setSetores(data));
  }, []);

  //

  useEffect(() => {
    fetch("/api/categorias/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((error) => console.error("Erro ao buscar dados:", error));
  }, []);
  const categoriasPorGrupo = categorias.reduce(
    (acc, cat) => {
      if (!acc[cat.grupo]) acc[cat.grupo] = [];
      acc[cat.grupo].push(cat);
      return acc;
    },
    {} as Record<string, typeof categorias>,
  );

  const carregarDados = async () => {
    try {
      const [perfilRes, chamadosRes] = await Promise.all([
        fetch("/api/my-tickets/profile"),
        fetch("/api/my-tickets/meus-chamados-pendentes"),
      ]);

      if (!perfilRes.ok || !chamadosRes.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const perfil = await perfilRes.json();
      const chamados = await chamadosRes.json();

      setDadosUsuario({
        nome_user: perfil.nome_user || "",
        sobrenome_user: perfil.sobrenome_user || "",
        email_user: perfil.email_user || "",
        telefone: perfil.telefone || "",
        perfil: perfil.perfil || "",
      });

      setMeusChamados(chamados);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const carregar = async () => {
      await carregarDados();
    };

    carregar();
  }, []);

  const fecharFormularioLocal = () => {
    setMostrarFormulario(false);
  };

  const handleSubmitOcorrencia = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setMensagem("");

    const resposta = await fetch("/api/my-tickets/enviar-ocorrencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setor, categoria, descricao }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      setMensagem(dados.erro);
      return;
    }

    await carregarDados();
    fecharFormularioLocal();

    setMensagem(`${dados.num_chamado} criado com sucesso!`);

    setTimeout(() => {
      setMensagem("");
    }, 3000);

    setSetor("");
    setCategoria("");
    setDescricao("");
  };

  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = "usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    await router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-monochromatic-4)">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-(--color-monochromatic-2) text-sm">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TituloSite titulo="Perfil Usuário" />

      <div className="min-h-screen flex flex-col">
        <TopBar
          nomeUsuario={`${dadosUsuario.nome_user} ${dadosUsuario.sobrenome_user}`}
        />

        <div
          onClick={handleLogout}
          className="flex justify-end mt-2 mr-5 uppercase text-xs text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) underline cursor-pointer transition-colors"
        >
          Sair
        </div>

        <div className="flex-1">
          {!mostrarFormulario && (
            <div className="interface flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-5 py-10 sm:py-20 px-4">
              <BotaoEstilizado
                icon="bi bi-plus-circle"
                texto="Abrir chamado"
                id="btAbrirChamado"
                onClick={() => setMostrarFormulario(true)}
              />

              <BotaoEstilizado
                icon="bi-card-checklist"
                texto="Histórico de chamados"
                id="btHistoricoChamado"
              />
            </div>
          )}

          {mensagem && (
            <div className="interface py-4">
              <p
                className={`text-sm font-bold text-center px-4 py-2 rounded-lg max-w-md mx-auto ${
                  mensagem.includes("sucesso")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {mensagem}
              </p>
            </div>
          )}

          {mostrarFormulario && (
            <div className="interface mt-4 sm:mt-10 px-2 sm:px-4">
              <div className="max-w-3xl mx-auto mt-5">
                <div className="bg-(--color-monochromatic-5) rounded-none shadow-2xl overflow-hidden">
                  <div className="p-4 sm:p-8">
                    <form
                      id="criarChamado"
                      className="flex flex-col gap-4 sm:gap-5"
                      onSubmit={handleSubmitOcorrencia}
                    >
                      {/* Nome | Sobrenome */}
                      <div>
                        <label className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block">
                          <i className="bi bi-person-fill mr-2"></i>
                          Nome | Sobrenome
                          <span className="text-red-600">*</span>
                        </label>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={dadosUsuario.nome_user}
                            readOnly
                            className="w-full sm:w-1/2 px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm"
                            required
                            autoFocus
                          />

                          <input
                            type="text"
                            value={dadosUsuario.sobrenome_user}
                            readOnly
                            className="w-full sm:w-1/2 px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* E-mail */}
                      <div>
                        <label
                          htmlFor="inEmailUsuario"
                          className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                        >
                          <i className="bi bi-envelope-at-fill mr-2"></i>
                          E-mail
                          <span className="text-red-600">*</span>
                        </label>

                        <input
                          type="email"
                          id="inEmailUsuario"
                          value={dadosUsuario.email_user}
                          readOnly
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm"
                          required
                        />
                      </div>

                      {/* Telefone */}
                      <div>
                        <label
                          htmlFor="inTelefoneUsuario"
                          className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                        >
                          <i className="bi bi-telephone-fill mr-2"></i>
                          Telefone
                          <span className="text-red-600">*</span>
                        </label>

                        <input
                          type="tel"
                          id="inTelefoneUsuario"
                          value={dadosUsuario.telefone}
                          readOnly
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm"
                          required
                        />
                      </div>

                      {/* Setor e Categoria */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-1/2">
                          <label
                            htmlFor="inSetorUsuario"
                            className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                          >
                            <i className="bi bi-buildings-fill mr-2"></i>
                            Setor
                            <span className="text-red-600">*</span>
                          </label>

                          <select
                            value={setor}
                            onChange={(e) => setSetor(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs sm:text-sm"
                            required
                          >
                            <option value="" disabled>
                              Selecione...
                            </option>
                            {setores.map((s) => (
                              <option key={s.id_setor} value={s.codigo}>
                                {s.descricao}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-1/2">
                          <label
                            htmlFor="inCategoria"
                            className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                          >
                            <i className="bi bi-tag-fill mr-1"></i>
                            Categoria
                            <span className="text-red-600">*</span>
                          </label>

                          <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs sm:text-sm"
                            required
                          >
                            <option value="" disabled>
                              Selecione...
                            </option>

                            {Object.entries(categoriasPorGrupo).map(
                              ([grupo, items]) => (
                                <optgroup key={grupo} label={grupo}>
                                  {items.map((cat) => (
                                    <option
                                      key={cat.id_categoria}
                                      value={cat.codigo}
                                    >
                                      {cat.descricao}
                                    </option>
                                  ))}
                                </optgroup>
                              ),
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Anexar arquivo */}
                      <div>
                        <label
                          htmlFor="anexarArquivo"
                          className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                        >
                          <i className="bi bi-paperclip mr-1"></i>
                          Anexar Arquivo
                        </label>

                        <div className="flex items-center gap-3">
                          <label
                            htmlFor="anexarArquivo"
                            className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) text-sm px-4 py-2 font-bold uppercase tracking-wider cursor-pointer hover:bg-(--color-monochromatic-2) transition-colors duration-200 rounded-lg"
                          >
                            <i className="bi bi-folder2-open mr-2"></i>
                            Escolher
                          </label>

                          <span
                            id="nomeArquivo"
                            className="text-(--color-monochromatic-3) text-sm truncate max-w-50"
                          >
                            Nenhum arquivo selecionado
                          </span>

                          <button
                            type="button"
                            id="btnRemoverArquivo"
                            className="text-(--color-monochromatic-3) hover:text-red-600 transition-colors hidden"
                            onClick={removerArquivo}
                          >
                            <i className="bi bi-x-circle-fill"></i>
                          </button>
                        </div>

                        <input
                          type="file"
                          id="anexarArquivo"
                          className="hidden"
                          onChange={atualizarNomeArquivo}
                          multiple
                        />
                      </div>

                      {/* Descrição */}
                      <div>
                        <label
                          htmlFor="inTextoArea"
                          className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                        >
                          <i className="bi bi-pencil-fill mr-2"></i>
                          Descrição
                        </label>

                        <textarea
                          id="inTextoArea"
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          rows={4}
                          placeholder="Escreva detalhes do caso..."
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm resize-y"
                        />
                      </div>

                      {/* Botões */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center mt-2">
                        <BotaoPrincipal
                          icon="bi-send-check"
                          texto="Enviar"
                          tipo="submit"
                        />

                        <BotaoPrincipal
                          icon="bi-eraser"
                          texto="Limpar"
                          tipo="button"
                          onClick={() =>
                            botaoLimpar(setSetor, setCategoria, setDescricao)
                          }
                        />

                        <BotaoPrincipal
                          icon="bi-x-circle-fill"
                          texto="Cancelar"
                          tipo="button"
                          onClick={() => setMostrarFormulario(false)}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div>
            {/* Tabela chamados */}
            <div className="interface py-4 sm:py-6 px-2 sm:px-0">
              <h2 className="text-base sm:text-lg font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-3 sm:mb-4">
                <i className="bi bi-list-check mr-2"></i> Meus Chamados
              </h2>
              <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-x-auto">
                <table className="w-full min-w-150">
                  <thead className="bg-(--color-monochromatic-1)">
                    <tr>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                        Nº Chamado
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                        Categoria
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                        Solicitante
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                        Setor
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {meusChamados.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center text-(--color-monochromatic-3) text-xs py-8"
                        >
                          Nenhum chamado encontrado
                        </td>
                      </tr>
                    ) : (
                      meusChamados.map((chamado) => (
                        <tr
                          key={chamado.num_chamado}
                          className="border-b border-(--color-monochromatic-4) hover:bg-(--color-monochromatic-4)/10 transition-colors cursor-pointer"
                        >
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) font-bold text-xs sm:text-sm whitespace-nowrap">
                            {chamado.num_chamado}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm">
                            {chamado.categoria}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
                            {dadosUsuario.nome_user}{" "}
                            {dadosUsuario.sobrenome_user}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
                            {chamado.setor}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                            <span
                              className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                                chamado.status_ocorrencia === "Pendente"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : chamado.status_ocorrencia === "Em andamento"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {chamado.status_ocorrencia}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <FooterEstilizacao />
      </div>
    </>
  );
}
